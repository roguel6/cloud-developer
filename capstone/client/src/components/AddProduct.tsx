import * as React from 'react'
import { CardColumns, Card, Button, Form, Col } from 'react-bootstrap'
import Auth from '../auth/Auth'
import { History } from 'history'
import { createProduct } from '../api/products-api'
import { CreateProductRequest } from '../types/CreateProductRequest'
import { getProduct, updateProduct, getUploadUrl, uploadFile } from '../api/products-api'
import { Product } from '../types/Product'
import { Grid, Loader } from 'semantic-ui-react'



enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface AddProductProps {
  auth: Auth,
  history: History,
  match: {
    params: {
      productId: string
    }
  }
}

interface AddProductState {
  product: CreateProductRequest,
  file: any,
  uploadState: UploadState,
  loading: boolean,
  editMode: boolean,
  productId: string
}


export class AddProduct extends React.PureComponent<
AddProductProps,
AddProductState
> {

  async componentDidMount() {
    if (this.props.match.params.productId) {
      this.setState({
        loading: true,
        editMode: true
      })
      const editProduct: CreateProductRequest = await getProduct(this.props.auth.getIdToken(), this.props.match.params.productId)
      this.setState({
        product: editProduct,
        productId: this.props.match.params.productId,
        loading: false
      })
    }
  }

  state: AddProductState = {
    product: {
      title: '',
      description: '',
      category: 'Jewelry',
      price: 0,
      stock: 0,
      imageUrl: 'https://www.storyofthebison.com/new/wp-content/uploads/woocommerce-placeholder-300x300.png',
    },
    file: '',
    uploadState: UploadState.NoUpload,
    loading: false,
    editMode: false,
    productId: ''
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    this.setState({
      loading: true
    })
    const newProduct: CreateProductRequest = this.state.product

    try {
      let product: Product
      if (this.state.editMode) {
        product = await updateProduct(this.props.auth.getIdToken(), newProduct, this.state.productId)
      } else {
        product = await createProduct(this.props.auth.getIdToken(), newProduct)
      }


      if (this.state.file !== "") {
        console.log('uploading a file');
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), product.productId)
        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)
        // newProduct.imageUrl = uploadUrl
      }

      
      this.props.history.goBack()
    } catch {
      alert('Product creation failed')
    }

  }


  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }


  handleLogin() {
    this.props.auth.login()
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          { this.renderLoadingText() }
        </Loader>
      </Grid.Row>
    )
  }

  renderLoadingText() {
    if (this.state.editMode) {
      return (
        "Updating your Product"
      )
    } else {
      return (
        "Creating your new Product"
      )
      
    }
  }

  render() {
    if (!this.props.auth.isAuthenticated()) {
      return (
      <div>
        <p className="no-results">Please log in to create a product</p>
        <Button variant="outline-danger" block onClick={() => this.handleLogin()}>Log in</Button>
      </div>
      )
    }

    if (this.state.loading) {
      return this.renderLoading()
    }

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="formGroupTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              required 
              type="text" 
              value={this.state.product.title}
              onChange={e => this.setState(prevState => ({
                product: {                   
                    ...prevState.product,    
                    title: e.target.value   
                }
            }))}
              placeholder="Title" />
          </Form.Group>
          <Form.Group controlId="formGroupDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={this.state.product.description}
              onChange={e => this.setState(prevState => ({
                product: {                   
                    ...prevState.product,    
                    description: e.target.value   
                }
            }))}
              placeholder="Description" />
          </Form.Group>
          <Form.Group controlId="formGroupCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control 
              required 
              as="select" 
              value={this.state.product.category}
              onChange={e => this.setState(prevState => ({
                product: {                   
                    ...prevState.product,    
                    category: e.target.value   
                }
            }))}
              custom>
              <option>Jewelry</option>
              <option>Toys</option>
            </Form.Control>
          </Form.Group>
          <Form.Row>
            <Col>
              <Form.Group controlId="formGroupPrice">
                <Form.Label>Price (€)</Form.Label>
                <Form.Control 
                  required 
                  type="number" 
                  placeholder="Price (€)" 
                  value={this.state.product.price}
                  onChange={e => this.setState(prevState => ({
                    product: {                   
                        ...prevState.product,    
                        price: +e.target.value   
                    }
                }))}
                   />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formGroupStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control 
                  required 
                  type="number" 
                  placeholder="Stock" 
                  value={this.state.product.stock}
                  onChange={e => this.setState(prevState => ({
                    product: {                   
                        ...prevState.product,    
                        stock: +e.target.value   
                    }
                }))}
                   />
              </Form.Group>
            </Col>
          </Form.Row>
          <Form.Group>
            <Form.File 
              id="image"
              label="Image file input"
              accept="image/*"
              onChange={this.handleFileChange}
              custom
            />
          </Form.Group>
            <Button type="submit" block>{ (this.state.editMode) ? "Update the product":"Create a product"}</Button>
          <br></br>
        </Form>
      </div>
    )
  }
}
