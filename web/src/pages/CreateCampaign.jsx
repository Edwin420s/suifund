import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useWalletClient } from '../hooks/useWalletClient'
import { useAppStore } from '../stores/useAppStore'
import { useCampaigns } from '../hooks/useCampaigns'
import CreateForm from '../components/campaign/CreateForm'

const CreateCampaign = () => {
  const { connected } = useWalletClient()
  const { setCurrentView } = useAppStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    beneficiaries: [{ address: '', percentage: '' }]
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!connected) return
    
    setIsLoading(true)
    try {
      // Here you would implement the contract interaction
      console.log('Creating campaign:', formData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCurrentView('explorer')
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          You need to connect your wallet to create a campaign
        </p>
        <Button>Connect Wallet</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('explorer')}
        >
          ← Back
        </Button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Title
            </label>
            <Input
              placeholder="e.g., Build a new community center"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Funding Goal (SUI)
              </label>
              <Input
                type="number"
                placeholder="1000"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deadline
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                required
              />
            </div>
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

            <div className="space-y-3">
              {formData.beneficiaries.map((beneficiary, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Wallet address"
                      value={beneficiary.address}
                      onChange={(e) => handleBeneficiaryChange(index, 'address', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="%"
                      value={beneficiary.percentage}
                      onChange={(e) => handleBeneficiaryChange(index, 'percentage', e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBeneficiary(index)}
                    disabled={formData.beneficiaries.length === 1}
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
            disabled={isLoading}
          >
            {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}

export default CreateCampaign