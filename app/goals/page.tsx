'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  priority: number;
  type: 'emergency' | 'investment' | 'general';
}

type EditMode = 'add-contribution' | 'edit-goal' | 'add-new' | null;

export default function GoalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);

  // Form state for contributions
  const [contributionAmount, setContributionAmount] = useState('');

  // Form state for editing goals
  const [editForm, setEditForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    type: 'general' as 'emergency' | 'investment' | 'general',
    priority: '1',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Goals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (goalId: string) => {
    if (!contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newAmount = goal.current_amount + amount;

      const { error } = await (supabase as any)
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      setGoals(goals.map(g =>
        g.id === goalId ? { ...g, current_amount: newAmount } : g
      ));

      setEditingGoalId(null);
      setEditMode(null);
      setContributionAmount('');
    } catch (error) {
      console.error('Contribution error:', error);
      alert('Failed to add contribution');
    }
  };

  const handleSubtractContribution = async (goalId: string) => {
    if (!contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newAmount = Math.max(0, goal.current_amount - amount);

      const { error } = await (supabase as any)
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);

      if (error) throw error;

      // Update local state
      setGoals(goals.map(g =>
        g.id === goalId ? { ...g, current_amount: newAmount } : g
      ));

      setEditingGoalId(null);
      setEditMode(null);
      setContributionAmount('');
    } catch (error) {
      console.error('Subtract error:', error);
      alert('Failed to subtract amount');
    }
  };

  const startEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditMode('edit-goal');
    setEditForm({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      type: goal.type,
      priority: goal.priority.toString(),
    });
  };

  const startAddNew = () => {
    setEditingGoalId('new');
    setEditMode('add-new');
    setEditForm({
      name: '',
      target_amount: '',
      current_amount: '0',
      type: 'general',
      priority: '1',
    });
  };

  const handleSaveGoal = async () => {
    if (!editForm.name || !editForm.target_amount) {
      alert('Please fill in goal name and target amount');
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const goalData = {
        name: editForm.name,
        target_amount: parseFloat(editForm.target_amount),
        current_amount: parseFloat(editForm.current_amount || '0'),
        type: editForm.type,
        priority: parseInt(editForm.priority),
      };

      if (editMode === 'add-new') {
        // Create new goal
        const { error } = await (supabase as any)
          .from('goals')
          .insert({
            ...goalData,
            user_id: user.id,
          });

        if (error) throw error;
      } else if (editingGoalId) {
        // Update existing goal
        const { error } = await (supabase as any)
          .from('goals')
          .update(goalData)
          .eq('id', editingGoalId);

        if (error) throw error;
      }

      // Reload goals
      await loadGoals();
      handleCancel();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      // Reload goals
      await loadGoals();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete goal');
    }
  };

  const handleCancel = () => {
    setEditingGoalId(null);
    setEditMode(null);
    setContributionAmount('');
    setEditForm({
      name: '',
      target_amount: '',
      current_amount: '0',
      type: 'general',
      priority: '1',
    });
  };

  const calculateProgress = (current: number, target: number): number => {
    return Math.min(100, (current / target) * 100);
  };

  const getGoalTypeIcon = (type: string): string => {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'investment':
        return '📈';
      default:
        return '🎯';
    }
  };

  const getGoalTypeColor = (type: string): string => {
    switch (type) {
      case 'emergency':
        return 'text-danger-600';
      case 'investment':
        return 'text-primary-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">← Goals</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Add New Goal Button */}
          {!editMode && (
            <Button onClick={startAddNew} fullWidth>
              + Add New Goal
            </Button>
          )}

          {/* Add/Edit Goal Form */}
          {(editMode === 'add-new' || editMode === 'edit-goal') && (
            <Card className="border-2 border-primary-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editMode === 'add-new' ? 'Add New Goal' : 'Edit Goal'}
              </h3>

              <div className="space-y-4">
                <Input
                  label="Goal Name"
                  placeholder="e.g., Emergency Fund, Vacation, New Laptop"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Target Amount (₱)"
                    type="number"
                    placeholder="50000"
                    value={editForm.target_amount}
                    onChange={(e) => setEditForm({ ...editForm, target_amount: e.target.value })}
                  />

                  <Input
                    label="Current Amount (₱)"
                    type="number"
                    placeholder="0"
                    value={editForm.current_amount}
                    onChange={(e) => setEditForm({ ...editForm, current_amount: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Type
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="emergency">🚨 Emergency</option>
                      <option value="investment">📈 Investment</option>
                      <option value="general">🎯 General</option>
                    </select>
                  </div>

                  <Input
                    label="Priority (1-10)"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1"
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button onClick={handleSaveGoal} fullWidth>
                    {editMode === 'add-new' ? 'Add Goal' : 'Save Changes'}
                  </Button>
                  <Button onClick={handleCancel} variant="secondary" fullWidth>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <Card className="text-center">
              <p className="text-gray-600">No goals set yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Click "Add New Goal" to get started.
              </p>
            </Card>
          ) : (
            <>
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Financial Goals
                </h2>
                <p className="text-sm text-gray-600">
                  Track progress towards your savings targets
                </p>
              </Card>

              <div className="space-y-3">
                {goals.map((goal) => {
                  const progress = calculateProgress(goal.current_amount, goal.target_amount);
                  const remaining = goal.target_amount - goal.current_amount;
                  const isComplete = progress >= 100;
                  const isEditingThis = editingGoalId === goal.id && editMode === 'add-contribution';

                  return (
                    <Card key={goal.id} className={isComplete ? 'border-2 border-primary-500' : ''}>
                      <div className="space-y-4">
                        {/* Goal Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="text-3xl">
                              {getGoalTypeIcon(goal.type)}
                            </span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {goal.name}
                              </h3>
                              <p className={`text-sm ${getGoalTypeColor(goal.type)}`}>
                                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {isComplete && (
                              <span className="text-2xl">✅</span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(goal.current_amount)}
                            </span>
                            <span className="text-gray-600">
                              {formatCurrency(goal.target_amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                isComplete ? 'bg-primary-600' : 'bg-primary-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-600">
                              {progress.toFixed(1)}% complete
                            </span>
                            {!isComplete && (
                              <span className="text-gray-600">
                                {formatCurrency(remaining)} remaining
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons / Forms */}
                        {!isComplete && (
                          <div className="pt-4 border-t border-gray-200">
                            {isEditingThis ? (
                              <div className="space-y-3">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  value={contributionAmount}
                                  onChange={(e) => setContributionAmount(e.target.value)}
                                  autoFocus
                                />
                                <div className="grid grid-cols-3 gap-2">
                                  <Button
                                    onClick={() => handleAddContribution(goal.id)}
                                    fullWidth
                                  >
                                    + Add
                                  </Button>
                                  <Button
                                    onClick={() => handleSubtractContribution(goal.id)}
                                    variant="danger"
                                    fullWidth
                                  >
                                    - Subtract
                                  </Button>
                                  <Button
                                    onClick={handleCancel}
                                    variant="secondary"
                                    fullWidth
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingGoalId(goal.id);
                                    setEditMode('add-contribution');
                                    setContributionAmount('');
                                  }}
                                  variant="secondary"
                                  fullWidth
                                >
                                  Contribute
                                </Button>
                                <Button
                                  onClick={() => startEditGoal(goal)}
                                  variant="secondary"
                                  fullWidth
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteGoal(goal.id)}
                                  variant="danger"
                                  fullWidth
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {isComplete && (
                          <div className="pt-4 border-t border-primary-200 space-y-3">
                            <p className="text-center text-primary-700 font-semibold">
                              🎉 Goal achieved! Great work!
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => startEditGoal(goal)}
                                variant="secondary"
                                fullWidth
                              >
                                Edit Goal
                              </Button>
                              <Button
                                onClick={() => handleDeleteGoal(goal.id)}
                                variant="danger"
                                fullWidth
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* Back to Dashboard */}
          <div className="text-center pt-4">
            <Link href="/dashboard">
              <Button variant="secondary">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
