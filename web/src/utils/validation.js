export const validateCampaignForm = (formData) => {
  const errors = {}

  // Title validation
  if (!formData.title?.trim()) {
    errors.title = 'Title is required'
  } else if (formData.title.length < 5) {
    errors.title = 'Title must be at least 5 characters long'
  } else if (formData.title.length > 100) {
    errors.title = 'Title must be less than 100 characters'
  }

  // Description validation
  if (!formData.description?.trim()) {
    errors.description = 'Description is required'
  } else if (formData.description.length < 20) {
    errors.description = 'Description must be at least 20 characters long'
  } else if (formData.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters'
  }

  // Goal validation
  if (!formData.goal || parseFloat(formData.goal) <= 0) {
    errors.goal = 'Valid goal amount is required'
  } else if (parseFloat(formData.goal) > 1000000) {
    errors.goal = 'Goal amount is too large'
  }

  // Deadline validation
  if (!formData.deadline) {
    errors.deadline = 'Deadline is required'
  } else {
    const deadline = new Date(formData.deadline)
    const now = new Date()
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day from now
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now

    if (deadline < minDate) {
      errors.deadline = 'Deadline must be at least 1 day from now'
    } else if (deadline > maxDate) {
      errors.deadline = 'Deadline cannot be more than 1 year from now'
    }
  }

  // Beneficiaries validation
  if (!formData.beneficiaries || formData.beneficiaries.length === 0) {
    errors.beneficiaries = 'At least one beneficiary is required'
  } else {
    let totalPercentage = 0
    formData.beneficiaries.forEach((beneficiary, index) => {
      if (!beneficiary.address?.trim()) {
        errors[`beneficiary-address-${index}`] = 'Address is required'
      } else if (!isValidSuiAddress(beneficiary.address)) {
        errors[`beneficiary-address-${index}`] = 'Invalid Sui address'
      }

      const percentage = parseFloat(beneficiary.percentage)
      if (!beneficiary.percentage || isNaN(percentage) || percentage <= 0) {
        errors[`beneficiary-percentage-${index}`] = 'Valid percentage is required'
      } else if (percentage > 100) {
        errors[`beneficiary-percentage-${index}`] = 'Percentage cannot exceed 100%'
      } else {
        totalPercentage += percentage
      }
    })

    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.beneficiaries = 'Total percentage must equal 100%'
    }
  }

  return errors
}

export const isValidSuiAddress = (address) => {
  // Sui addresses are 32 bytes, represented as 64 hex characters starting with 0x
  return /^0x[0-9a-fA-F]{64}$/.test(address)
}

export const validateContribution = (amount, balance = 0) => {
  const errors = {}

  if (!amount || parseFloat(amount) <= 0) {
    errors.amount = 'Valid amount is required'
  } else if (parseFloat(amount) > balance) {
    errors.amount = 'Insufficient balance'
  } else if (parseFloat(amount) < 0.1) {
    errors.amount = 'Minimum contribution is 0.1 SUI'
  } else if (parseFloat(amount) > 100000) {
    errors.amount = 'Maximum contribution is 100,000 SUI'
  }

  return errors
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}