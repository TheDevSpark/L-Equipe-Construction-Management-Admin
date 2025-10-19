import supabase from '../../lib/supabaseClinet.js';

// Budget Categories API
export const budgetCategoriesApi = {
  // Get all budget categories for a project
  async getCategories(projectId) {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      return { data: null, error };
    }
  },

  // Create a new budget category
  async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating budget category:', error);
      return { data: null, error };
    }
  },

  // Update a budget category
  async updateCategory(categoryId, updates) {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating budget category:', error);
      return { data: null, error };
    }
  },

  // Delete a budget category
  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting budget category:', error);
      return { error };
    }
  }
};

// Expenses API
export const expensesApi = {
  // Get all expenses for a project
  async getExpenses(projectId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          budget_categories (
            category_name
          )
        `)
        .eq('project_id', projectId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return { data: null, error };
    }
  },

  // Create a new expense
  async createExpense(expenseData) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select(`
          *,
          budget_categories (
            category_name
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating expense:', error);
      return { data: null, error };
    }
  },

  // Update an expense
  async updateExpense(expenseId, updates) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select(`
          *,
          budget_categories (
            category_name
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating expense:', error);
      return { data: null, error };
    }
  },

  // Delete an expense
  async deleteExpense(expenseId) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { error };
    }
  },

  // Upload receipt file
  async uploadReceipt(file, fileName) {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `receipts/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('budget-files')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('budget-files')
        .getPublicUrl(filePath);

      return { data: { filePath, publicUrl }, error: null };
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return { data: null, error };
    }
  }
};

// Change Orders API
export const changeOrdersApi = {
  // Get all change orders for a project
  async getChangeOrders(projectId) {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .select(`
          *,
          budget_categories (
            category_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching change orders:', error);
      return { data: null, error };
    }
  },

  // Create a new change order
  async createChangeOrder(changeOrderData) {
    try {
      // Generate change order number
      const changeOrderNumber = `CO-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('change_orders')
        .insert([{ ...changeOrderData, change_order_number: changeOrderNumber }])
        .select(`
          *,
          budget_categories (
            category_name
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating change order:', error);
      return { data: null, error };
    }
  },

  // Update a change order
  async updateChangeOrder(changeOrderId, updates) {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .update(updates)
        .eq('id', changeOrderId)
        .select(`
          *,
          budget_categories (
            category_name
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating change order:', error);
      return { data: null, error };
    }
  },

  // Delete a change order
  async deleteChangeOrder(changeOrderId) {
    try {
      const { error } = await supabase
        .from('change_orders')
        .delete()
        .eq('id', changeOrderId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting change order:', error);
      return { error };
    }
  }
};

// Payments API
export const paymentsApi = {
  // Get all payments for a project
  async getPayments(projectId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          expenses (
            expense_name,
            amount
          )
        `)
        .eq('project_id', projectId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { data: null, error };
    }
  },

  // Create a new payment
  async createPayment(paymentData) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select(`
          *,
          expenses (
            expense_name,
            amount
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { data: null, error };
    }
  },

  // Update a payment
  async updatePayment(paymentId, updates) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select(`
          *,
          expenses (
            expense_name,
            amount
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { data: null, error };
    }
  },

  // Delete a payment
  async deletePayment(paymentId) {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting payment:', error);
      return { error };
    }
  }
};

// Budget Summary API
export const budgetSummaryApi = {
  // Get budget summary for a project
  async getBudgetSummary(projectId) {
    try {
      const { data, error } = await supabase
        .from('budget_summary')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      return { data: null, error };
    }
  },

  // Calculate budget variance
  async getBudgetVariance(projectId) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_budget_variance', { project_uuid: projectId });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error calculating budget variance:', error);
      return { data: null, error };
    }
  }
};

// Budget Milestones API
export const budgetMilestonesApi = {
  // Get all budget milestones for a project
  async getMilestones(projectId) {
    try {
      const { data, error } = await supabase
        .from('budget_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching budget milestones:', error);
      return { data: null, error };
    }
  },

  // Create a new budget milestone
  async createMilestone(milestoneData) {
    try {
      const { data, error } = await supabase
        .from('budget_milestones')
        .insert([milestoneData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating budget milestone:', error);
      return { data: null, error };
    }
  },

  // Update a budget milestone
  async updateMilestone(milestoneId, updates) {
    try {
      const { data, error } = await supabase
        .from('budget_milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating budget milestone:', error);
      return { data: null, error };
    }
  },

  // Delete a budget milestone
  async deleteMilestone(milestoneId) {
    try {
      const { error } = await supabase
        .from('budget_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting budget milestone:', error);
      return { error };
    }
  }
};

// Utility functions
export const budgetUtils = {
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  // Calculate percentage
  calculatePercentage: (part, total) => {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  // Get budget status color
  getBudgetStatusColor: (percentage) => {
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-yellow-600';
    return 'text-green-600';
  },

  // Get payment status color
  getPaymentStatusColor: (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Get change order status color
  getChangeOrderStatusColor: (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
};
