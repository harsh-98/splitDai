const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const express = require('express');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const Tx = require('ethereumjs-tx');
const request = require('request');

const NETWORK_ID = 5777;

const SplitETHJSON = require('../build/contracts/SplitETH.json');
const splitETHAddress = SplitETHJSON.networks[NETWORK_ID].address;
const splitETHABI = SplitETHJSON.abi;
const splitETH = new web3.eth.Contract(splitETHABI,splitETHAddress);

const SETokenJSON = require('../build/contracts/SEToken.json');
const SETAddress = SETokenJSON.networks[NETWORK_ID].address;
const SETABI = SETokenJSON.abi;
const seToken = new web3.eth.Contract(SETABI,SETAddress);

const bodyParser = require('body-parser');
const cors = require('cors');

// region app
const app = express();

var memoize = {};
const cleanAsciiText = text => text && text.replace(/[\x00-\x09\x0b-\x1F]/g, '').trim();

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable CORS - Cross Origin Resource Sharing
app.use(cors());
// endregion

mongoose.connect('mongodb://127.0.0.1:27017/test',{ useNewUrlParser: true });

const BalanceEntrySchema = Schema({
    address: String,
    value: String
});

const SignatureSchema = Schema({
    signer: String,
    v: String,
    r: String,
    s: String
});


const BillSchema = Schema({
    name: String,
    state: String,
    fullySigned: Boolean,
    totalAmount: String,
    totalBalanceChange: [BalanceEntrySchema],
    balanceChange: [BalanceEntrySchema],
    parts: [BalanceEntrySchema],
    payments: [BalanceEntrySchema],
    signatures: [SignatureSchema],
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    timestamp: Number
});

const UserModel = mongoose.model('User', Schema({
    name: String,
    signature: String
}));

const GroupModel = mongoose.model('Group', Schema({
    name: String,
    numParticipants: Number,
    bills: [BillSchema],
    members: [String]
}));

const BillModel = mongoose.model('Bill', BillSchema);

function clean(str) {
    ans = str.replace(/[^\x00-\x7F]/g, "");
    return ans;
}

const main = async () => {
    app.post('/group', async (req, res) => {
        console.log('body', req.body);

        const group = new GroupModel({
            name: req.body.name,
            numParticipants: req.body.numParticipants,
            members: req.body.members
        });

        await group.save();
        console.log('group saved');

        res.json(group);
    });

    app.post('/group/:group_name/bill', async (req, res) => {
        console.log('body', req.body);

        GroupModel.findOne({ name: req.params.group_name }, (err, group) => {
            console.log('/group/:group_name/bill', err, group);
            const bill = new BillModel({
                name: req.body.name,
                state: req.body.state,
                signatures: req.body.signatures,
                balanceChange: req.body.balanceChange,
                totalBalanceChange: req.body.totalBalanceChange,
                parts: req.body.parts,
                payments: req.body.payments,
                fullySigned: req.body.fullySigned || false,
                totalAmount: req.body.totalAmount,
                timestamp: new Date().getTime()
            });

            group.bills.push(bill);

            group.save();

            res.json(bill);
        });
    });

    
    app.get('/user/:user_signature', async (req, res) => {
        console.log('body', req.params.user_signature.toLowerCase() );

        UserModel.findOne({ signature: req.params.user_signature }, (err, user) => {
            console.log('/user/:user_signature', err, user);
            res.json(user);
        });
    });

    app.get('/group/:group_id/bills', async (req, res) => {
        GroupModel.findOne({ name: req.params.group_id }, (err, group) => {
            res.json(group && group.bills);
        });
    });

    app.get('/group/:group_id/last-bill-signed', async (req, res) => {
        GroupModel.findOne({ name: req.params.group_id }, (err, group) => {
            res.json(group && group.bills && group.bills.find(bill => bill.fullySigned));
        });
    });


    app.get('/group/:group_id/bills_not_signed/:address_id', async (req, res) => {
        GroupModel.findOne({ name: req.params.group_id }, (err, group) => {
            const notSigned = group.bills.filter(({ signatures }) => {
                return signatures.filter(({ signer }) => signer.toLowerCase() === req.params.address_id.toLowerCase()).length > 0
            });

            res.json(notSigned);
        });
    });

    app.post('/group/:group_id/bills/:bill_id/add-signature', async (req, res) => {
        if (!req.body.signature) {
            return res.json({
                error: 'No signature'
            });
        }

        GroupModel.findOne({ name: req.params.group_id }, async (err, group) => {
            const bill = group.bills.id(req.params.bill_id);

            if (bill.signatures.find(({ signer }) => signer.toLowerCase() === req.body.signature.signer.toLowerCase())) {
                return res.json({
                    error: 'Signature already present.'
                });
            }

            bill.signatures.push(req.body.signature);

            if (bill.signatures.length === group.numParticipants) {
                bill.fullySigned = true;
            }

            await group.save();

            res.json(bill);
        });
    });

    /* ----------------------------FOR ANDROID-----------------------------------*/

    app.get('/accounts', async (req, res) => {
        web3.eth.getAccounts().then(data => {
            res.json({ accounts: data});
        });
    });

    /**
     * @param privateKey: Private key of the user
     * @param receivingAddr: Receiving address
     * @param amount: Amount to be sent
     */
    app.put('/transaction', async (req, res) => {

        const privateKey = new Buffer(req.body.privateKey, 'hex');

        // The recieving address of the transaction
        const receivingAddr = req.body.receivingAddr;

        // Value to be sent, converted to wei and then into a hex value
        const txValue = web3.utils.numberToHex(web3.utils.toWei(req.body.amount, 'ether'));

        // Data to be sent in transaction, converted into a hex value. Normal tx's do not need this and use '0x' as default, but who wants to be normal?
        const txData = web3.utils.asciiToHex('oh hai mark'); 
        let nonce = web3.eth.getTransactionCount(web3.eth.defaultAccount);

        const rawTx = {
            nonce: nonce, // Nonce is the times the address has transacted, should always be higher than the last nonce 0x0#
            gasPrice: 0.00000000001, // Normal is '0x14f46b0400' or 90 GWei
            gasLimit: '0x55f0', // Limit to be used by the transaction, default is '0x55f0' or 22000 GWei
            to: receivingAddr, // The receiving address of this transaction
            value: txValue, // The value we are sending '0x16345785d8a0000' which is 0.1 Ether
            data: txData // The data to be sent with transaction, '0x6f6820686169206d61726b' or 'oh hai mark' 
        }

        //console.log(rawTx); // This is used for testing to see if the rawTx was formmated created properly, comment out the code below to use.
        const tx = new Tx(rawTx);
        tx.sign(privateKey); // Here we sign the transaction with the private key

        const serializedTx = tx.serialize(); // Clean things up a bit

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')) // Broadcast the transaction to the network
        .on('receipt', res.json); 
    });

    app.get('/getGroupById', async (req, res) => {
        splitETH.getPastEvents('GroupCreated', {
            fromBlock: 0,
            toBlock: 'latest'
        }, function(){})
        .then(async function(events){
          const groups = [];

          for (let element of events) {
            var friends = [];
            for (let usr of element.returnValues._users) {
              const result = await splitETH.methods.groupBalances(element.returnValues._name,usr).call();

              friends.push({
                address:usr,
                balance:result
              })
            }
            memoize[req.params.name] = friends;
            let temp = cleanAsciiText(web3.utils.toAscii(element.returnValues._name));
            groups.push({
                name: temp,
                friends: friends,
                timeout: element.returnValues._timeout
            });
          }
          console.log(req.body.name);
        //   console.log('groups', groups, 'name', name, name === groups[0].name, groups.find(group => group.name === name));
          console.log(groups);
          res.json(groups.find(group => group.name === req.query.name));
        });
    });

    app.get('/getEthBalance', async (req, res) => {
        web3.eth.getBalance(req.query.address)
        .then(bal => {
            res.json({
                myBalance: web3.utils.fromWei(bal,"Ether")
            });
        });
    });

    // For DAI
    app.get('/tokenBalance', async (req, res) => {

        seToken.methods.balanceOf(req.query.address).call()
        .then(function(bal){
            res.json({tokenBalance: web3.utils.fromWei(bal)});
        });
    });

    // Covert Ethereum to DAI tokens
    app.put('/convertEthToDai', async (req, res) => { 
        seToken.methods.getTokens(
            req.body.address,
            web3.utils.toWei("100000")
        ).send({from:req.body.address}).then((data) => res.json(data));
    });

    app.get('/getGroups', async (req, res) => {
        
        let groups;
        splitETH.getPastEvents('GroupCreated', {
            fromBlock: 0,
            toBlock: 'latest'
        }, function(){})
        .then(async function(events){
          
          if(!events) res.json({});
          groups = [];
          console.log("events!!!!! : " + events);
  
          for (let element of events) {
            console.log("element!!!!! : " + element);
            var friends = [];
            for (let usr of element.returnValues._users) {
              const result = await splitETH.methods.groupBalances(element.returnValues._name,usr).call();
  
              friends.push({
                address:usr,
                balance:result
              })
            }

            const myBal = await splitETH.methods.groupBalances(element.returnValues._name, req.query.address).call();
  
            const result2 = await splitETH.methods.groupCloseTime(element.returnValues._name).call();
            console.log("que",result2);
            return res.send({
              groups: [...groups, {
                  name: cleanAsciiText(web3.utils.toAscii(element.returnValues._name)),
                  friends: friends,
                  timeout: element.returnValues._timeout,
                  closed: result2 > 0 ? true : false,
                  myBal:myBal
                }]
            });
        }
    }); 
    });

    app.post('/submitNewChannel', async (req, res) => {

        var groupName = web3.utils.fromAscii(req.body.groupName);
        let addresses = [];
        request(`http://localhost:3001/getGroups/?address=${req.body.address}`, async (error, response, body) => {
            let friends = JSON.parse(response.body).groups[0].friends;
            console.log(friends);
            friends.forEach(function(element) {
                addresses.push(element.address);
            });
            var tokenAddress = req.body.tokenAddress;
            var expiry = req.body.expiry;
            
            const receipt = await splitETH.methods.createGroup(
                groupName,
                addresses,
                tokenAddress,
                expiry).send({from:req.body.address});
            
            const group = new GroupModel({
                name: req.body.groupName,
                numParticipants: req.body.numParticipants,
                members: req.body.members
            });

            await group.save();
            console.log('group saved');

            res.json(group);
        });
    });

    app.post('/submitJoinChannel', async (req, res) => {

    //  console.log("Initial Groupname :" + event.target.GroupName.value);
      var groupName = web3.utils.fromAscii(req.body.groupName);
      var user = req.body.user;
      var amount = req.body.amount;

      await seToken.methods.approve(splitETH._address,web3.utils.toWei(amount,"ether"))
      .call()
      .then(function(){
          
          console.log("ERC20 approve successful");
          console.log("Groupname :" + groupName + " " + typeof groupName);
          console.log("User :" + user + " " + typeof user);

          splitETH.methods.fundUser(
          groupName,
          user,
          web3.utils.toWei(amount,"ether")
        ).send({from: req.body.user})
        .then(function(){
          res.json({message:"Split Ether successful"});
        });
      });
    });

    app.put('/pullFundsFromChannel', async (req, res) => {
      await splitETH.methods.pullFunds(
        web3.utils.fromAscii(req.body.group)
      ).send({from:req.body.address})
      .then(function(receipt){
        res.json(receipt);
      });
    });

/*-------------------- END ---------------------*/

    app.listen(3001, () => console.log('Example app listening on port 3001!'))
};

main();
