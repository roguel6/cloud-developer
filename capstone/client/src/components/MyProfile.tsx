import * as React from 'react'
import { ButtonGroup, Card, Button, Form, Col, Table } from 'react-bootstrap'
import Auth from '../auth/Auth'
import { History } from 'history'
import { Product } from '../types/Product'
import { deleteProduct, getMyProducts } from '../api/products-api'
import { Grid, Loader } from 'semantic-ui-react'
import { AiFillDelete, AiFillEdit } from 'react-icons/ai'

interface MyProfileProps {
  auth: Auth,
  history: History
}

interface MyProfileState {
  products: Product[],
  loadingProducts: boolean
}


export class MyProfile extends React.PureComponent<
MyProfileProps,
MyProfileState
> {

  state: MyProfileState = {
    products: [],
    loadingProducts: true
  }

  updateProduct = async (productId:string) => {
    this.props.history.push(`/add-product/`+productId)
  }

  deleteProduct = async (productId:string) => {
    await deleteProduct(this.props.auth.getIdToken(), productId)
    try {
      const products = await getMyProducts(this.props.auth.getIdToken())
      this.setState({
        products,
        loadingProducts: false
      })
    } catch (e) {
      alert(`Failed to fetch products: ${e.message}`)
    }
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading your Products
        </Loader>
      </Grid.Row>
    )
  }

  renderProducts() {
    if (this.state.loadingProducts) {
      return this.renderLoading()
    }
    return this.renderProductsList()
  }

  onAddProductButtonClick = () => {
    this.props.history.push(`/add-product`)
  }

  renderProductsList() {
    return (
      <div>
          <h1>Your products</h1>
          <Button variant="outline-success" block onClick={() => this.onAddProductButtonClick()}>+ Create a new product</Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price (€)</th>
                <th>Stock</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.products.map((product, pos) => {
                return (
                  <tr key={ product.productId }>
                    <td><a href={ product.imageUrl } target="_blank"><img className="my-profile-image" src={ product.imageUrl } /></a></td>
                    <td>{ product.title }</td>
                    <td>{ product.description }</td>
                    <td>{ product.category }</td>
                    <td>{ product.price }</td>
                    <td>{ product.stock }</td>
                    <td>{ product.createdAt }</td>
                    <td>
                    <ButtonGroup className="mb-2">
                      <Button variant="warning" onClick={() => this.updateProduct(product.productId)}>
                        <AiFillEdit />
                      </Button>
                      <Button variant="danger" onClick={() => this.deleteProduct(product.productId)}>
                        <AiFillDelete />
                      </Button>
                    </ButtonGroup>
                    </td>
                  </tr>
                  )
                })}
            </tbody>
        </Table>
      </div>
    )
  }

  handleLogin() {
    this.props.auth.login()
  }

  async componentDidMount() {
    try {
      const products = await getMyProducts(this.props.auth.getIdToken())
      this.setState({
        products,
        loadingProducts: false
      })
    } catch (e) {
      alert(`Failed to fetch products: ${e.message}`)
    }
  }
  
  render() {
    if (!this.props.auth.isAuthenticated()) {
      return (
      <div>
        <p className="no-results">Please log in to see your profile</p>
        <Button variant="outline-danger" block onClick={() => this.handleLogin()}>Log in</Button>
      </div>
      )
    }
    return this.renderProducts()
  }

}
