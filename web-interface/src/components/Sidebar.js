import React, { Component } from 'react';
import { Menu, Icon, Sidebar } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

class SideBar extends Component {

    render() {
        const style = { height: '50px' }
        const zIndex = { zIndex: 0 }
        return (
            <Sidebar as={Menu} vertical left visible className="thin" inverted style={zIndex}>
                <Menu.Item style={style}>
                </Menu.Item>
                <Link to="/create">
                    <Menu.Item>
                        Create group
            <Icon name='add' />
                    </Menu.Item>
                </Link>
                {/* <Link to="/view">
                    <Menu.Item>
                        View Groups
            <Icon name='list' />
                    </Menu.Item>
                </Link> */}
                <Link to="/about">
                    <Menu.Item>
                        See Bills
            <Icon name='list alternate outline' />
                    </Menu.Item>
                </Link>

                <Link to="/wallet">
                    <Menu.Item>
                        Wallet
            <Icon name='mail' />
                    </Menu.Item>
                </Link>
            </Sidebar>
        )
    }
}

export default SideBar
