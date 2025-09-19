import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

const CreateForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    beneficiaries: [{ address: '', percentage: '' }]
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBeneficiaryChange = (index, field, value) => {
    const newBeneficiaries = [...formData.beneficiaries]
    newBeneficiaries[index][field] = value
    setFormData(prev => ({ ...prev, beneficiaries: newBeneficiaries }))
  }

  const addBeneficiary = () => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { address: '', percentage: '' }]
    }))
  }

  const removeBeneficiary = (index) => {
    if (formData.beneficiaries.length === 1) return
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.goal || parseFloat(formData.goal) <= 0) newErrors.goal = 'Valid goal amount is required'
    if (!formData.deadline) newErrors.deadline = 'Deadline is required'
    
    // Validate beneficiaries
    let totalPercentage = 0
    formData.beneficiaries.forEach((beneficiary, index) => {
      if (!beneficiary.address.trim()) {
        newErrors[`beneficiary-address-${index}`] = 'Address is required'
      }
      if (!beneficiary.percentage || parseFloat(beneficiary.percentage) <= 0) {
        newErrors[`beneficiary-percentage-${index}`] = 'Valid percentage is required'
      } else {
        totalPercentage += parseFloat(beneficiary.percentage)
      }
    })
    
    if (totalPercentage !== 100) {
      newErrors.beneficiaries = 'Total percentage must equal 100%'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Campaign Title"
        placeholder="e.g., Build a new community center"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={errors.title}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          placeholder="Describe your project in detail..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[120px]"
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Funding Goal (SUI)"
          type="number"
          placeholder="1000"
          value={formData.goal}
          onChange={(e) => handleInputChange('goal', e.target.value)}
          error={errors.goal}
          min="1"
          step="0.01"
          required
        />

        <Input
          label="Deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => handleInputChange('deadline', e.target.value)}
          error={errors.deadline}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-300">
            Beneficiaries
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBeneficiary}
          >
            Add Beneficiary
          </Button>
        </div>

        {errors.beneficiaries && (
          <p className="text-sm text-red-500 mb-4">{errors.beneficiaries}</p>
        )}

        <div className="space-y-3">
          {formData.beneficiaries.map((beneficiary, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-1">
                <Input
                  placeholder="Wallet address"
                  value={beneficiary.address}
                  onChange={(e) => handleBeneficiaryChange(index, 'address', e.target.value)}
                  error={errors[`beneficiary-address-${index}`]}
                  required
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  placeholder="%"
                  value={beneficiary.percentage}
                  onChange={(e) => handleBeneficiaryChange(index, 'percentage', e.target.value)}
                  error={errors[`beneficiary-percentage-${index}`]}
                  min="1"
                  max="100"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeBeneficiary(index)}
                disabled={formData.beneficiaries.length === 1}
                className="mt-2"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
      >
        Create Campaign
      </Button>
    </form>
  )
}

export default CreateForm