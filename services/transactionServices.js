import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const TransactionService = {
  async saveTransaction(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserTransactions(userAddress) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getUserAssets(userAddress) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())

    if (error) throw error
    return data
  }
}