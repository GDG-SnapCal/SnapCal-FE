import api from '../lib/axios'

export interface Category {
  categoryId: number
  name: string
  colorHex: string
  isDefault: boolean
}

export const getCategories = () => api.get<Category[]>('/categories')
