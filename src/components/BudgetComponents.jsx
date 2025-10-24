"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import supabase from "../../lib/supabaseClinet";

// Budget Category Card Component
export function BudgetCategoryCard({ category, onEdit, onDelete }) {
  const percentageUsed = (category.spent / category.allocated) * 100;
  const isOverBudget = percentageUsed > 100;
  const isNearBudget = percentageUsed > 80;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className={`${isOverBudget ? 'border-red-500 bg-red-50' : isNearBudget ? 'border-yellow-500 bg-yellow-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(category)}>
              Delete
            </Button>
          </div>
        </div>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Allocated:</span>
            <span className="font-medium">{formatCurrency(category.allocated)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent:</span>
            <span className="font-medium">{formatCurrency(category.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining:</span>
            <span className={`font-medium ${category.remaining < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(category.remaining)}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usage:</span>
              <span className={`font-medium ${isOverBudget ? 'text-red-600' : isNearBudget ? 'text-yellow-600' : 'text-green-600'}`}>
                {percentageUsed.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div  
                className={`h-2 rounded-full transition-all ${
                  isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-yellow-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              ></div>
            </div>
          </div>

          {isOverBudget && (
            <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
              ⚠️ This category has exceeded its budget allocation!
            </div>
          )}
          {isNearBudget && !isOverBudget && (
            <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
              ⚠️ This category is approaching its budget limit!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Expense Card Component
export function ExpenseCard({ expense, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{expense.expenseName}</h3>
              <p className="text-sm text-muted-foreground">
                {expense.category} • {expense.vendor} • {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-semibold text-foreground">{formatCurrency(expense.amount)}</div>
              <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(expense.paymentStatus)}`}>
                {expense.paymentStatus}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {expense.receipt && (
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Receipt
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(expense)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Change Order Card Component
export function ChangeOrderCard({ changeOrder, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const difference = changeOrder.newAmount - changeOrder.oldAmount;
  const isIncrease = difference > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Change Order #{changeOrder.changeOrderNumber}</CardTitle>
          <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(changeOrder.status)}`}>
            {changeOrder.status}
          </div>
        </div>
        <CardDescription>{changeOrder.reason}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Old Amount</div>
              <div className="font-medium">{formatCurrency(changeOrder.oldAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">New Amount</div>
              <div className="font-medium">{formatCurrency(changeOrder.newAmount)}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Difference:</span>
            <span className={`font-semibold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
              {isIncrease ? '+' : ''}{formatCurrency(difference)}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            <div>Approved by: {changeOrder.approvedBy}</div>
            <div>Date: {new Date(changeOrder.approvalDate).toLocaleDateString()}</div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(changeOrder)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(changeOrder)}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// File Upload Component
export function FileUpload({ onFileSelect, accept = "*" }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-2">
        <svg className="w-8 h-8 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="text-sm text-muted-foreground">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="font-medium text-primary hover:text-primary/80">Click to upload</span> or drag and drop
          </label>
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
}

// Budget Alert Component
export function BudgetAlert({ type, message, onClose }) {
  const getAlertStyles = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start space-x-3 ${getAlertStyles(type)}`}>
      <div className="flex-shrink-0">
        {getIcon(type)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current hover:opacity-75"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}




