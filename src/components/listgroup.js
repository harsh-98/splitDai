import React, { Component } from 'react';
import {BigNumber} from 'bignumber.js';
import SplitETHJSON from '../build/contracts/SplitETH.json'
import SETokenJSON from '../build/contracts/SEToken.json'
import { Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { Table } from 'reactstrap';
import { toWei } from './Expenses';


export const NETWORK_ID = 5777;


class ListGroup extends Component {
    constructor(props){
        super(props)
        this.handlePullFundsFromChannel = this.handlePullFundsFromChannel.bind(this);
        this.handleJoinChannel = this.handleJoinChannel.bind(this);
        this.handleCloseChannel = this.handleCloseChannel.bind(this);

        const splitETHAddress = SplitETHJSON.networks[NETWORK_ID].address;
        const splitETHABI = SplitETHJSON.abi;

        const SETAddress = SETokenJSON.networks[NETWORK_ID].address;
        const SETABI = SETokenJSON.abi;

        const splitETH = new props.web3.eth.Contract(splitETHABI,splitETHAddress);
        const splitETH_event = new props.web3WH.eth.Contract(splitETHABI,splitETHAddress);
        splitETH_event.setProvider(props.web3WH.currentProvider);

        const seToken = new props.web3.eth.Contract(SETABI,SETAddress);
        const seToken_event = new props.web3WH.eth.Contract(SETABI,SETAddress);
        seToken_event.setProvider(props.web3WH.currentProvider);

        window.postGroupToAPI = this.postGroupToAPI;

        this.state = {
            web3: props.web3,
            web3WH: props.web3WH,
            splitETH:splitETH,
            splitETH_event:splitETH_event,
            seToken:seToken,
            myValue:0,
            selectedOption:0,
            name: '',
            friends: [{ address: '' }],
            groups: []
          };

    }


    async handleJoinChannel(group) {
        console.log(group);
        //event.preventDefault();
        this.setState({
          selectedOption:2,
          selectedGroup:group
        });
      }

    async handlePullFundsFromChannel(group) {
        console.log(group);
        var _this = this;
        await this.state.splitETH.methods.pullFunds(
          this.state.web3.utils.fromAscii(group)
        ).send({from:this.state.accounts[0]})
        .then(function(receipt){
          console.log(receipt);
          _this.getGroups();
        });

      }

      async handleCloseChannel(group) {
        console.debug('handleClosechannel', group);

        const lastBillSigned = await this.getLastBillSigned(group);

        console.debug('handleCloseChannel', {
          lastBillSigned
        });

        console.log(group);
        var _this = this;

        const addressMapping = {

        };

        const vArray = [];
        const rArray = [];
        const sArray = [];
        const weiArray = [];
        const signArray = [];

        lastBillSigned.signatures.map(signature => {
          addressMapping[signature.signer.toLowerCase()] = signature;
        });

        lastBillSigned.totalBalanceChange.map((entry, index) => {
          const sign = parseInt(entry.value) >= 0;
          const wei = toWei(entry.value).toString();

          console.debug("!!", {
            sign,
            wei
          });

          addressMapping[entry.address.toLowerCase()].wei = wei;
          addressMapping[entry.address.toLowerCase()].sign = sign;;
        });



        for (let address of Object.keys(addressMapping)) {
          const entry = addressMapping[address];

          vArray.push(entry.v);
          rArray.push(entry.r);
          sArray.push(entry.s);
          weiArray.push((new BigNumber(entry.wei).absoluteValue().toString()));
          signArray.push(entry.sign);
        }

        const parameters = [
          this.state.web3.utils.fromAscii(group),
          weiArray,
          signArray,
          lastBillSigned.timestamp,
          vArray,
          rArray,
          sArray
        ];

        console.log('closeChannel', parameters);

        await this.state.splitETH.methods.closeGroup(...parameters).send({from:this.state.accounts[0]})
        .then(function(receipt){
          console.log(receipt);
          _this.getGroups();
        });

      }

    renderGroupList(){

        const listItems = this.state.groups.map((group) => {

          const participantsItems = group.friends.map((participant,i) => {

            var participantItem = {
              address: participant.address,
              balance: participant.balance
            }

            return(
              <li key={i}>{participantItem.address} - Balance: {this.state.web3.utils.fromWei(participant.balance,"ether")} DAI
              </li>
            )
          })

          if(group.closed && group.myBal != 0){
            return (<tr>
              <th scope="row">{group.name}</th>
              <td>{participantsItems}</td>
              <td>{group.timeout}</td>
              <td>Group is closed</td>
              <td><Link href="" to={"/expenses/"+group.name}>View Expenses</Link></td>
              <td><Button color="info" size="sm" onClick={() => this.handlePullFundsFromChannel(group.name)}>Pull Funds</Button></td>

            </tr>);
          }else if(group.closed && group.myBal == 0){
            return (<tr>
              <th scope="row">{group.name}</th>
              <td>{participantsItems}</td>
              <td>{group.timeout}</td>
              <td>Group is closed</td>
              <td><Link href="" to={"/expenses/"+group.name}>View Expenses</Link></td>
              <td>Balance pulled</td>

            </tr>);
          }else{
            return (<tr>
              <th scope="row">{group.name}</th>
              <td>{participantsItems}</td>
              <td>{group.timeout}</td>
              <td> <Button color="primary" size="sm" onClick={() => this.handleJoinChannel(group.name)}>Add Balance</Button></td>
              <td><a href={"#/expenses/"+group.name}>Manage Expenses</a></td>
              <td>
                <div><Button color="danger" size="sm" onClick={() => this.handleCloseChannel(group.name)}>CLOSE</Button></div>
              </td>

            </tr>);
          }
        });

        return (
          <Table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Participants</th>
                <th>Timeout</th>
                <th>Balance</th>
                <th>Expenses</th>
                <th>Close Group</th>
              </tr>
            </thead>
            <tbody>
              {listItems}
            </tbody>
          </Table>
        );
      }

    render() {
        return (
            <div>
                {this.renderGroupList()}
            </div>
        )
    }
}

export default ListGroup
