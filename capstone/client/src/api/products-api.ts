import { apiEndpoint } from '../config'
import { Product } from '../types/Product';
import { CreateProductRequest } from '../types/CreateProductRequest';
import Axios from 'axios'


export async function getProduct(idToken: string, productId: string): Promise<CreateProductRequest> {
  console.log('Fetching product with Id '+productId)

  const response = await Axios.get(`${apiEndpoint}/product/${productId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Product:', response.data)
  return response.data.items
}

export async function getProductsForUser(idToken: string): Promise<Product[]> {
  console.log('Fetching products')

  const response = await Axios.get(`${apiEndpoint}/products`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Products:', response.data)
  return response.data.items
}

export async function getProducts(idToken: string): Promise<Product[]> {
  console.log('Fetching products')

  const response = await Axios.get(`${apiEndpoint}/products`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Products:', response.data)
  return response.data.items
}

export async function getMyProducts(idToken: string): Promise<Product[]> {
  console.log('Fetching my products')

  const response = await Axios.get(`${apiEndpoint}/my-products`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('My Products:', response.data)
  return response.data.items
}

export async function deleteProduct(
  idToken: string,
  productId: string
): Promise<void> {
  const response = await Axios.delete(`${apiEndpoint}/product/${productId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function createProduct(
  idToken: string,
  newProduct: CreateProductRequest
): Promise<Product> {
  const response = await Axios.post(`${apiEndpoint}/products`,  JSON.stringify(newProduct), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function updateProduct(
  idToken: string,
  updateProduct: CreateProductRequest,
  productId: string
): Promise<Product> {
  const response = await Axios.patch(`${apiEndpoint}/product/${productId}`,  JSON.stringify(updateProduct), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function getUploadUrl(
  idToken: string,
  productId: string
): Promise<string> {
  try {
    const response = await Axios.post(`${apiEndpoint}/products/${productId}/imageUrl`, '', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
    return response.data.uploadUrl
  } catch (e) {
    console.log(e);
    return "";
  }
  
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
