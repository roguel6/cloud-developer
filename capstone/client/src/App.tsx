import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import React, { Component } from 'react'
import { Route, Router, Switch } from 'react-router-dom'
import { Grid, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { NotFound } from './components/NotFound'

import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'

import { GiHeartEarrings } from 'react-icons/gi'
import { AiOutlineLogin, AiOutlineLogout, AiOutlineUser } from 'react-icons/ai'
import { Products } from './components/Products'
import { AddProduct } from './components/AddProduct'
import { MyProfile } from './components/MyProfile'


export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.setState({
      shoppingCart: {
        count: 0,
        products: []
      }
    })

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.goToProfile = this.goToProfile.bind(this)
    this.goToHome = this.goToHome.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  goToProfile() {
    this.props.history.push(`/my-profile`)
  }

  goToHome() {
    this.props.history.push(`/`)
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {

    return (

      <Navbar bg="danger" variant="dark" expand="lg" fixed="top">
        <Navbar.Brand onClick={this.goToHome}><GiHeartEarrings />&nbsp;&nbsp;&nbsp;&nbsp;Made with love</Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {this.profileButton()}
          {this.logInLogOutButton()}
        </Navbar.Collapse>
      </Navbar>
    )
  }


  profileButton() {

    if (this.props.auth.isAuthenticated()) {
      return (
        <Button variant="danger" onClick={this.goToProfile}>
          My Profile &nbsp;&nbsp;
          <AiOutlineUser className="login-button" />
        </Button>
      )
    } 

  }

  logInLogOutButton() {

    if (this.props.auth.isAuthenticated()) {
      return (
        <Button variant="danger" onClick={this.handleLogout}>
          Log out &nbsp;&nbsp;
          <AiOutlineLogout className="login-button" />
        </Button>
      )
    } else {
      return (
        <Button variant="danger" onClick={this.handleLogin}>
          Log in &nbsp;&nbsp;
          <AiOutlineLogin className="login-button" />
        </Button>
      )
    }
  }

  generateCurrentPage() {

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Products {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/add-product/:productId"
          render={props => {
            return <AddProduct {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/add-product"
          render={props => {
            return <AddProduct {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/my-profile"
          exact
          render={props => {
            return <MyProfile {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
