import * as React from 'react'
import { CardColumns, Card, Button, Container, Row, Col } from 'react-bootstrap'
import Auth from '../auth/Auth'
import { History } from 'history'
import { getProducts } from '../api/products-api'
import { Product } from '../types/Product'
import { Grid, Loader } from 'semantic-ui-react'
import { AiOutlineShopping } from 'react-icons/ai'



interface ProductsProps {
  auth: Auth,
  history: History
}

interface ProductsState {
  products: Product[]
  loadingProducts: boolean
}


export class Products extends React.PureComponent<
  ProductsProps,
  ProductsState
> {

  state: ProductsState = {
    products: [],
    loadingProducts: true
  }

  onAddProductButtonClick = () => {
    this.props.history.push(`/add-product`)
  }

  async componentDidMount() {
    try {
      const products = await getProducts(this.props.auth.getIdToken())
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
          Loading Products
        </Loader>
      </Grid.Row>
    )
  }
  
  renderProducts() {
    if (this.state.loadingProducts) {
      return this.renderLoading()
    }
    if (!this.state.products) {
      return (
        <div>
          <p className="no-results">No products to show</p>
          { this.renderCreateProductButton() }
        </div>
      )
    } else {
      return this.renderProductsList()
    }
  }

  getProductDescription(description:string, length:number) {
    let trimmedDescription = description.length > length ? 
      description.substring(0, length - 3) + "..." : 
      description
    return trimmedDescription
  }

  renderCreateProductButton() {
    return (
      <Button variant="outline-success" block onClick={() => this.onAddProductButtonClick()}>Sell your products!</Button>
    )
  }

  renderProductsList() {
    return (
      <div>
          { this.renderCreateProductButton() }
          <br></br>
          <CardColumns>
            {this.state.products.map((product, pos) => {
              return (
              <Card key={product.productId}>
                <Card.Img variant="top" src={product.imageUrl} className="card-image" />
                <Card.Body>
                  <Card.Title>{ product.title }</Card.Title>
                  <Card.Text className="product-card-text" >
                    { this.getProductDescription(""+product.description, 100)  }
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <Container>
                    <Row>
                      <Col className="footer-price">
                        <div> { parseFloat(""+product.price).toFixed(2) } €</div>
                        </Col>
                      <Col className="footer-buy-button">
                        <Button>
                          Buy &nbsp;&nbsp;<AiOutlineShopping />
                          </Button>
                      </Col>
                    </Row>
                  </Container>
                </Card.Footer>
              </Card>
              )
            })}
          </CardColumns>
      </div>
    )
  }

  render() {
      return (
        <div>
          {this.renderProducts()}
        </div>
      )
  }
}
