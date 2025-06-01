import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { Button, Navbar, Modal } from 'react-bootstrap';
import { NavDropdown } from 'react-bootstrap';

import { useState, useContext } from 'react';

const NavbarMain = () => {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    return (
        <>
            <div id="MasterContainer">
                <Navbar bg="light" expand="lg">
                    <Navbar.Brand href="#/JavaScriptTesting" style={myStyles.navBarMarginLeft}>Basic Testing</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="#/">Home</Nav.Link>
                            <Navbar.Brand href="#/SimpleBotChat">SimpleBotChat</Navbar.Brand>
                            <Navbar.Brand href="#/ChatAgent">ChatAgent</Navbar.Brand>
                            <Navbar.Brand href="#/BotFrameworkChat">BotFrameworkChat</Navbar.Brand>
                            <Navbar.Brand href="#/CoPilotChat">CoPilotChat That Works Best</Navbar.Brand>
                        </Nav>

                    </Navbar.Collapse>

                    <Navbar.Toggle />

                </Navbar>

            </div>
        </>
    )

}

const myStyles = {
    navBarMarginLeft: {
        marginLeft: '15px'
    },
};


export default NavbarMain

