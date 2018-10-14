import React, { Component } from 'react';

import EthBalanceDisplay from './EthBalanceDisplay'
import { BigNumber } from 'bignumber.js';
import { Input, Menu, Segment, Button } from 'semantic-ui-react'
import SETokenJSON from '../build/contracts/SEToken.json'
import { NETWORK_ID } from './Channel';
import { Link } from 'react-router-dom';


class NavBar extends Component {

  constructor(props) {
    super(props);
    const SETAddress = SETokenJSON.networks[NETWORK_ID].address;
    const SETABI = SETokenJSON.abi;

    const seToken = new props.web3.eth.Contract(SETABI, SETAddress);
    const seToken_event = new props.web3WH.eth.Contract(SETABI, SETAddress);
    seToken_event.setProvider(props.web3WH.currentProvider);

    this.state = {
      web3: props.web3,
      web3WH: props.web3WH,
      seToken: seToken,
      seToken_event: seToken_event,
      activeItem: 'home'
    };

    this.handleGetTokens = this.handleGetTokens.bind(this);

  }

  async componentDidMount() {
    var _this = this;

    var accounts;
    this.state.web3.eth.getAccounts().then(res => {
      accounts = res;
      this.setState({ accounts: accounts });
      this.state.seToken.methods.balanceOf(this.state.accounts[0]).call()
      .then(function (res) {
        _this.setState({ tokenBalance: _this.state.web3.utils.fromWei(res) });
      });
    })

    this.state.seToken_event.events.Transfer({ fromBlock: 'latest', toBlock: 'latest' })
    .on('data', event => {
      //console.log("QQQ",event.returnValues._message);
      _this.state.seToken.methods.balanceOf(_this.state.accounts[0]).call()
      .then(function (res) {
            _this.setState({ tokenBalance: _this.state.web3.utils.fromWei(res) });
          });
        });


      }

      async handleGetTokens() {
        var _this = this;
        await this.state.seToken.methods.getTokens(
          this.state.accounts[0],
          this.state.web3.utils.toWei("100000")
        ).send({ from: this.state.accounts[0] })
        .then(function (receipt) {
          _this.state.seToken.methods.balanceOf(_this.state.accounts[0]).call()
          .then(function (res) {
            _this.setState({ tokenBalance: _this.state.web3.utils.fromWei(res) });
          });
        });
      }

      handleItemClick = (e, { name }) => {
        this.setState({ activeItem: name })
      }

      render() {
        return (
        <Menu pointing inverted className="top fixed">
        {/* <Link to='/'> */}
          <Menu.Item name='home' active={this.state.activeItem === 'home'} onClick={this.handleItemClick} />
        {/* </Link> */}

        {/* <Link to='/about'> */}
          {/* <Menu.Item
            name='about'
            active={this.state.activeItem === 'about'}
            onClick={this.handleItemClick}
            /> */}
          {/* </Link> */}

          <Menu.Menu position='right'>
            <Menu.Item>
            <Button onClick={() => this.handleGetTokens()}> Get DAI ({this.state.tokenBalance} DAI) </Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        )
  }
}

export default NavBar;
