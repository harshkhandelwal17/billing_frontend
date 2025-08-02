import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Search, Clock, 
  User, Phone, Mail, MapPin, Calendar, DollarSign,
  UserCheck, UserX, Users, Award, AlertCircle, Eye,
  Filter, Download, FileText, TrendingUp, Coffee,
  CheckCircle, XCircle, PlayCircle, PauseCircle,
  BarChart3, PieChart, Activity, Settings, Bell,
  ArrowLeft, ArrowRight, RefreshCw, Home, LogOut
} from 'lucide-react';

const EmployeeManagementSystem = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  
  // Data States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [payslipData, setPayslipData] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    role: 'waiter',
    department: 'service',
    salary: { base: '', overtime: '', bonus: '', deductions: '' },
    payrollType: 'monthly',
    hourlyRate: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    emergencyContact: { name: '', phone: '', relationship: '', address: '' },
    shiftTiming: { type: 'fixed', startTime: '09:00', endTime: '18:00', breakDuration: 60, weeklyOffs: [] },
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    skills: [],
    qualification: '',
    bankDetails: { accountNumber: '', ifscCode: '', bankName: '', branchName: '', accountHolderName: '' }
  });

  const API_BASE_URL = 'http://localhost:4000/api';

  // API Helper Function
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Constants
  const roles = ['waiter', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'supervisor', 'host', 'bartender', 'delivery-boy', 'security'];
  const departments = ['kitchen', 'service', 'management', 'maintenance', 'security', 'delivery'];
  
  const roleColors = {
    waiter: 'bg-blue-100 text-blue-800',
    cook: 'bg-orange-100 text-orange-800',
    chef: 'bg-red-100 text-red-800',
    cashier: 'bg-green-100 text-green-800',
    cleaner: 'bg-purple-100 text-purple-800',
    manager: 'bg-indigo-100 text-indigo-800',
    supervisor: 'bg-yellow-100 text-yellow-800',
    host: 'bg-pink-100 text-pink-800',
    bartender: 'bg-teal-100 text-teal-800',
    'delivery-boy': 'bg-cyan-100 text-cyan-800',
    security: 'bg-gray-100 text-gray-800'
  };

  // Data Fetching Functions
  const fetchEmployees = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: searchTerm,
        role: selectedRole,
        department: selectedDepartment,
        ...filters
      });
      
      const data = await apiCall(`/employees?${params}`);
      setEmployees(data.data.employees || []);
      setStats(data.data.stats || {});
      setTotalPages(data.meta?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      alert('Failed to fetch employees: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
  try {
    const data = await apiCall('/employees/attendance/today');
    // Handle different response structures
    const attendanceData = data.data?.attendanceSummary || data.data || data.attendanceSummary || [];
    setTodayAttendance(attendanceData);
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    // Don't show alert for attendance fetch failures, just log them
  }
};

  const fetchAttendanceStats = async () => {
    try {
      const data = await apiCall('/employees/stats/attendance');
      setAttendanceStats(data.data);
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error);
    }
  };

  // Employee Operations
  const handleAddEmployee = async () => {
    try {
      const payload = { ...formData };
      
      // Convert string values to numbers where needed
      if (payload.salary.base) payload.salary.base = parseFloat(payload.salary.base);
      if (payload.salary.overtime) payload.salary.overtime = parseFloat(payload.salary.overtime);
      if (payload.salary.bonus) payload.salary.bonus = parseFloat(payload.salary.bonus);
      if (payload.salary.deductions) payload.salary.deductions = parseFloat(payload.salary.deductions);
      if (payload.hourlyRate) payload.hourlyRate = parseFloat(payload.hourlyRate);

      await apiCall('/employees', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      await fetchEmployees(currentPage);
      setShowAddModal(false);
      resetForm();
      alert('Employee added successfully!');
    } catch (error) {
      alert('Failed to add employee: ' + error.message);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      const payload = { ...formData };
      
      // Convert string values to numbers
      if (payload.salary.base) payload.salary.base = parseFloat(payload.salary.base);
      if (payload.salary.overtime) payload.salary.overtime = parseFloat(payload.salary.overtime);
      if (payload.salary.bonus) payload.salary.bonus = parseFloat(payload.salary.bonus);
      if (payload.salary.deductions) payload.salary.deductions = parseFloat(payload.salary.deductions);
      if (payload.hourlyRate) payload.hourlyRate = parseFloat(payload.hourlyRate);
    console.log(editingEmployee)
      await apiCall(`/employees/${editingEmployee._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      await fetchEmployees(currentPage);
      setEditingEmployee(null);
      resetForm();
      alert('Employee updated successfully!');
    } catch (error) {
      alert('Failed to update employee: ' + error.message);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    try {
      await apiCall(`/employees/${employeeId}`, { 
        method: 'DELETE',
        body: JSON.stringify({ reason: 'Administrative deactivation' })
      });
      
      await fetchEmployees(currentPage);
      alert('Employee deactivated successfully!');
    } catch (error) {
      alert('Failed to deactivate employee: ' + error.message);
    }
  };

  // Attendance Operations
  const handleCheckIn = async (employeeId) => {
    try {
      await apiCall(`/employees/${employeeId}/checkin`, { 
        method: 'POST',
        body: JSON.stringify({
          workLocation: 'dining',
          latitude: 0,
          longitude: 0,
          address: 'Restaurant Location'
        })
      });
      
      await fetchTodayAttendance();
      alert('Check-in successful!');
    } catch (error) {
      alert('Check-in failed: ' + error.message);
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      await apiCall(`/employees/${employeeId}/checkout`, { 
        method: 'POST',
        body: JSON.stringify({
          latitude: 0,
          longitude: 0,
          address: 'Restaurant Location'
        })
      });
      
      await fetchTodayAttendance();
      alert('Check-out successful!');
    } catch (error) {
      alert('Check-out failed: ' + error.message);
    }
  };

  const handleStartBreak = async (employeeId, type = 'other') => {
  try {
    await apiCall(`/employees/${employeeId}/break/start`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
    
    await fetchTodayAttendance();
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} break started!`);
  } catch (error) {
    console.error('Break start error:', error);
    alert('Failed to start break: ' + error.message);
  }
};

  const handleEndBreak = async (employeeId) => {
  try {
    await apiCall(`/employees/${employeeId}/break/end`, {
      method: 'POST'
    });
    
    await fetchTodayAttendance();
    alert('Break ended!');
  } catch (error) {
    console.error('Break end error:', error);
    alert('Failed to end break: ' + error.message);
  }
};
  // View Details Functions
  const viewEmployeeDetails = async (employee) => {
    try {
      const data = await apiCall(`/employees/${employee._id}`);
      setSelectedEmployee(data.data);
      setShowDetailsModal(true);
    } catch (error) {
      alert('Failed to fetch employee details: ' + error.message);
    }
  };

// Fix for React Object Rendering Error

// 1. Fix the Salary Modal - Replace the problematic section:
{showSalaryModal && selectedEmployee && salaryData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Salary Details - {selectedEmployee.name}
          </h2>
          <button
            onClick={() => {
              setShowSalaryModal(false);
              setSalaryData(null);
              setSelectedEmployee(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Salary Breakdown for {salaryData.period?.monthName || 'Current Month'}
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-medium">₹{(salaryData.earnings?.baseSalary || 0).toLocaleString()}</span>
              </div>

              {(salaryData.earnings?.overtimePay || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Overtime Pay:</span>
                  <span className="font-medium">₹{(salaryData.earnings?.overtimePay || 0).toLocaleString()}</span>
                </div>
              )}

              {(salaryData.earnings?.totalAllowances || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span className="font-medium">₹{(salaryData.earnings?.totalAllowances || 0).toLocaleString()}</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              
              <div className="flex justify-between">
                <span>Gross Salary:</span>
                <span className="font-medium">₹{(salaryData.earnings?.grossSalary || 0).toLocaleString()}</span>
              </div>
              
              {(salaryData.deductions?.totalDeductions || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Deductions:</span>
                  <span className="font-medium">-₹{(salaryData.deductions?.totalDeductions || 0).toLocaleString()}</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              
              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>Net Salary:</span>
                <span>₹{(salaryData.earnings?.netSalary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-blue-600">
                {salaryData.period?.presentDays || salaryData.attendance?.presentDays || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Attendance %</p>
              <p className="text-2xl font-bold text-green-600">
                {salaryData.period?.attendancePercentage || salaryData.attendance?.attendancePercentage || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

// 2. Fix the viewSalaryDetails function to ensure proper data structure:
const viewSalaryDetails = async (employee) => {
  try {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const data = await apiCall(`/employees/${employee._id}/salary/${month}/${year}`);
    
    console.log('Raw salary data:', data); // Debug log
    
    // Ensure we have a proper data structure
    const salaryInfo = data.data || data;
    
    // Create a clean data structure to avoid rendering objects
    const cleanSalaryData = {
      period: {
        monthName: salaryInfo.period?.monthName || `${month}/${year}`,
        presentDays: Number(salaryInfo.period?.presentDays || salaryInfo.attendance?.presentDays || 0),
        attendancePercentage: Number(salaryInfo.period?.attendancePercentage || salaryInfo.attendance?.attendancePercentage || 0)
      },
      earnings: {
        baseSalary: Number(salaryInfo.earnings?.baseSalary || salaryInfo.baseSalary || salaryInfo.basePay || 0),
        overtimePay: Number(salaryInfo.earnings?.overtimePay || salaryInfo.overtimePay || 0),
        totalAllowances: Number(salaryInfo.earnings?.totalAllowances || 0),
        grossSalary: Number(salaryInfo.earnings?.grossSalary || salaryInfo.grossSalary || 0),
        netSalary: Number(salaryInfo.earnings?.netSalary || salaryInfo.netSalary || 0)
      },
      deductions: {
        totalDeductions: Number(salaryInfo.deductions?.totalDeductions || 0)
      },
      attendance: {
        presentDays: Number(salaryInfo.attendance?.presentDays || 0),
        attendancePercentage: Number(salaryInfo.attendance?.attendancePercentage || 0)
      }
    };
    
    console.log('Clean salary data:', cleanSalaryData); // Debug log
    
    setSalaryData(cleanSalaryData);
    setSelectedEmployee(employee);
    setShowSalaryModal(true);
  } catch (error) {
    console.error('Salary fetch error:', error);
    alert('Failed to fetch salary details: ' + error.message);
  }
};



 const viewPayslip = async (employee) => {
  try {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const data = await apiCall(`/employees/${employee._id}/salary/${month}/${year}`);
    
    console.log('Raw payslip data:', data); // Debug log
    
    const salaryInfo = data.data || data;
    
    // Create clean payslip data structure
    const cleanPayslipData = {
      employee: {
        name: String(employee.name || ''),
        employeeId: String(employee.employeeId || ''),
        department: String(employee.department || '')
      },
      period: {
        monthName: String(salaryInfo.period?.monthName || new Date(year, month - 1).toLocaleString('default', { month: 'long' })),
        year: Number(year),
        workingDays: Number(salaryInfo.period?.workingDays || 30),
        presentDays: Number(salaryInfo.period?.presentDays || salaryInfo.attendance?.presentDays || 0)
      },
      earnings: {
        basicSalary: Number(salaryInfo.earnings?.baseSalary || salaryInfo.baseSalary || salaryInfo.basePay || 0),
        overtimePay: Number(salaryInfo.earnings?.overtimePay || salaryInfo.overtimePay || 0),
        totalEarnings: Number(salaryInfo.earnings?.grossSalary || salaryInfo.grossSalary || 0)
      },
      deductions: Array.isArray(salaryInfo.deductions?.deductions) ? salaryInfo.deductions.deductions : [],
      totalDeductions: Number(salaryInfo.deductions?.totalDeductions || 0),
      netPay: Number(salaryInfo.earnings?.netSalary || salaryInfo.netSalary || 0),
      generatedOn: new Date().toISOString()
    };
    
    console.log('Clean payslip data:', cleanPayslipData); // Debug log
    
    setPayslipData(cleanPayslipData);
    setSelectedEmployee(employee);
    setShowPayslipModal(true);
  } catch (error) {
    console.error('Payslip fetch error:', error);
    alert('Failed to fetch payslip: ' + error.message);
  }
};



  // Form Helper Functions
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      alternatePhone: '',
      role: 'waiter',
      department: 'service',
      salary: { base: '', overtime: '', bonus: '', deductions: '' },
      payrollType: 'monthly',
      hourlyRate: '',
      address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      emergencyContact: { name: '', phone: '', relationship: '', address: '' },
      shiftTiming: { type: 'fixed', startTime: '09:00', endTime: '18:00', breakDuration: 60, weeklyOffs: [] },
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      skills: [],
      qualification: '',
      bankDetails: { accountNumber: '', ifscCode: '', bankName: '', branchName: '', accountHolderName: '' }
    });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      alternatePhone: employee.alternatePhone || '',
      role: employee.role || 'waiter',
      department: employee.department || 'service',
      salary: {
        base: employee.salary?.base?.toString() || '',
        overtime: employee.salary?.overtime?.toString() || '',
        bonus: employee.salary?.bonus?.toString() || '',
        deductions: employee.salary?.deductions?.toString() || ''
      },
      payrollType: employee.payrollType || 'monthly',
      hourlyRate: employee.hourlyRate?.toString() || '',
      address: employee.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      emergencyContact: employee.emergencyContact || { name: '', phone: '', relationship: '', address: '' },
      shiftTiming: employee.shiftTiming || { type: 'fixed', startTime: '09:00', endTime: '18:00', breakDuration: 60, weeklyOffs: [] },
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
      gender: employee.gender || '',
      bloodGroup: employee.bloodGroup || '',
      skills: employee.skills || [],
      qualification: employee.qualification || '',
      bankDetails: employee.bankDetails || { accountNumber: '', ifscCode: '', bankName: '', branchName: '', accountHolderName: '' }
    });
  };

  // Load initial data
  useEffect(() => {
    fetchEmployees(currentPage);
    fetchTodayAttendance();
    fetchAttendanceStats();
  }, [currentPage, searchTerm, selectedRole, selectedDepartment]);

  // Dashboard Component
  const Dashboard = () => {
    const presentToday = todayAttendance.filter(att => att.isPresent).length;
    const absentToday = todayAttendance.filter(att => !att.isPresent).length;
    const onBreakToday = todayAttendance.filter(att => att.onBreak).length;
    const totalEmployees = employees.length;
    const attendancePercentage = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-800">{totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentToday}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentToday}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Break</p>
                <p className="text-2xl font-bold text-yellow-600">{onBreakToday}</p>
              </div>
              <Coffee className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-purple-600">{attendancePercentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Today's Attendance</h2>
            <button
              onClick={fetchTodayAttendance}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayAttendance.slice(0, 9).map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {emp.isPresent ? (
                      emp.onBreak ? (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          On Break
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Present
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {todayAttendance.length > 9 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All ({todayAttendance.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Department Stats */}
        {attendanceStats && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Department Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(attendanceStats.departmentSummary || {}).map(([dept, data]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 capitalize">{dept}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {data.present}/{data.total}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${data.total > 0 ? (data.present / data.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Employee Card Component
  const EmployeeCard = ({ employee }) => {
    const attendance = todayAttendance.find(att => att.id === employee._id);
  const isOnBreak = attendance?.onBreak || false;

    
    return (
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.employeeId}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleColors[employee.role] || 'bg-gray-100 text-gray-800'}`}>
              {employee.role}
            </span>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>₹{employee.salary?.base?.toLocaleString()}/month</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="capitalize">{employee.department}</span>
            </div>
          </div>

          {/* Attendance Status */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {attendance?.isPresent ? (
                isOnBreak ? (
                  <Coffee className="w-5 h-5 text-yellow-600" />
                ) : (
                  <UserCheck className="w-5 h-5 text-green-600" />
                )
              ) : (
                <UserX className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {attendance?.isPresent 
                  ? (isOnBreak ? 'On Break' : 'Present') 
                  : 'Absent'
                }
              </span>
            </div>
            {attendance?.loginTime && (
              <span className="text-xs text-gray-600">
                In: {new Date(attendance.loginTime).toLocaleTimeString('en-US', { 
                  hour12: true, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>

          {/* Action Buttons */}
              <div className="flex space-x-2">
        {attendance?.isPresent ? (
          <>
            {isOnBreak ? (
              <button
                onClick={() => handleEndBreak(employee._id)}
                className="flex-1 bg-orange-100 text-orange-700 py-2 px-3 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              >
                End Break
              </button>
            ) : (
              <div className="flex space-x-1 flex-1">
                <button
                  onClick={() => handleStartBreak(employee._id, 'lunch')}
                  className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-2 rounded-lg hover:bg-yellow-200 transition-colors text-xs font-medium"
                  title="Lunch Break"
                >
                  Lunch
                </button>
                <button
                  onClick={() => handleStartBreak(employee._id, 'tea')}
                  className="flex-1 bg-green-100 text-green-700 py-2 px-2 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                  title="Tea Break"
                >
                  Tea
                </button>
              </div>
            )}
            
            <button
              onClick={() => handleCheckOut(employee._id)}
              disabled={attendance.logoutTime}
              className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {attendance.logoutTime ? 'Checked Out' : 'Check Out'}
            </button>
          </>
        ) : (
          <button
            onClick={() => handleCheckIn(employee._id)}
            className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
          >
            Check In
          </button>
        )}
      </div>

            {/* View Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => viewEmployeeDetails(employee)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Details</span>
              </button>
              
              <button
                onClick={() => viewSalaryDetails(employee)}
                className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <DollarSign className="w-4 h-4" />
                <span>Salary</span>
              </button>

              <button
                onClick={() => viewPayslip(employee)}
                className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-3 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Payslip</span>
              </button>
            </div>

            {/* Management Actions */}
            <div className="flex space-x-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => handleEdit(employee)}
                className="flex-1 flex items-center justify-center py-2 px-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              
              <button
                onClick={() => handleDeleteEmployee(employee._id)}
                className="flex-1 flex items-center justify-center py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </button>
            </div>
          </div>
        </div>
      // </div>
    );
  };

  // Employee Form Component
  const EmployeeForm = ({ isModal = false }) => (
    <div className={isModal ? 'space-y-4 max-h-96 overflow-y-auto' : 'space-y-6'}>
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
            <input
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter alternate phone"
            />
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Type *</label>
            <select
              value={formData.payrollType}
              onChange={(e) => setFormData({ ...formData, payrollType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary (₹) *</label>
            <input
              type="number"
              value={formData.salary.base}
              onChange={(e) => setFormData({ 
                ...formData, 
                salary: { ...formData.salary, base: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter base salary"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate (₹)</label>
            <input
              type="number"
              value={formData.salary.overtime}
              onChange={(e) => setFormData({ 
                ...formData, 
                salary: { ...formData.salary, overtime: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter overtime rate"
              min="0"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Bonus (₹)</label>
            <input
              type="number"
              value={formData.salary.bonus}
              onChange={(e) => setFormData({ 
                ...formData, 
                salary: { ...formData.salary, bonus: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter monthly bonus"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deductions (₹)</label>
            <input
              type="number"
              value={formData.salary.deductions}
              onChange={(e) => setFormData({ 
                ...formData, 
                salary: { ...formData.salary, deductions: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter deductions"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Shift Timing */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Shift Timing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={formData.shiftTiming.startTime}
              onChange={(e) => setFormData({ 
                ...formData, 
                shiftTiming: { ...formData.shiftTiming, startTime: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              value={formData.shiftTiming.endTime}
              onChange={(e) => setFormData({ 
                ...formData, 
                shiftTiming: { ...formData.shiftTiming, endTime: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (mins)</label>
            <input
              type="number"
              value={formData.shiftTiming.breakDuration}
              onChange={(e) => setFormData({ 
                ...formData, 
                shiftTiming: { ...formData.shiftTiming, breakDuration: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter street address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter city"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, state: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter state"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              value={formData.emergencyContact.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                emergencyContact: { ...formData.emergencyContact, name: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter emergency contact name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter emergency contact phone"
            />
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            if (isModal) {
              setShowAddModal(false);
            } else {
              setEditingEmployee(null);
            }
            resetForm();
          }}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{editingEmployee ? 'Update Employee' : 'Add Employee'}</span>
        </button>
      </div>
    </div>
  );

  // Employees Tab Component
  const EmployeesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-600">Manage your restaurant staff</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>
                {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept.charAt(0).toUpperCase() + dept.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit Form */}
      {editingEmployee && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Edit Employee</h3>
          <EmployeeForm />
        </div>
      )}

      {/* Employee Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(employee => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {employees.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No employees found</p>
              <p className="text-gray-400">Try adjusting your search or add new employees</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Attendance Tab Component
  const AttendanceTab = () => {
    const presentToday = todayAttendance.filter(att => att.isPresent).length;
    const absentToday = todayAttendance.filter(att => !att.isPresent).length;
    const onBreakToday = todayAttendance.filter(att => att.onBreak).length;
    const totalEmployees = todayAttendance.length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
            <p className="text-gray-600">Monitor real-time attendance and manage check-ins</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={fetchTodayAttendance}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Today's Attendance Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600">{presentToday}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600">{absentToday}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">On Break</p>
                <p className="text-3xl font-bold text-yellow-600">{onBreakToday}</p>
              </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-3">
              {todayAttendance.map(emp => {
                const isOnBreak = emp.onBreak || false;
                
                return (
                  <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-sm text-gray-600">{emp.role} • {emp.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        {emp.isPresent ? (
                          <>
                            <p className="text-gray-600">
                              In: {emp.loginTime ? new Date(emp.loginTime).toLocaleTimeString('en-US', { 
                                hour12: true, 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : '-'}
                            </p>
                            <p className="text-gray-600">
                              Hours: {emp.hoursWorked || 0}
                            </p>
                          </>
                        ) : (
                          <p className="text-red-600">Not checked in</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {emp.isPresent ? (
                          <>
                            {isOnBreak ? (
                              <>
                                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                  On Break
                                </span>
                                <button
                                  onClick={() => handleEndBreak(emp.id)}
                                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                                >
                                  End Break
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Present
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleStartBreak(emp.id, 'lunch')}
                                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                    title="Start Lunch Break"
                                  >
                                    Lunch
                                  </button>
                                  <button
                                    onClick={() => handleStartBreak(emp.id, 'tea')}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    title="Start Tea Break"
                                  >
                                    Tea
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleCheckOut(emp.id)}
                                  disabled={emp.logoutTime}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                >
                                  {emp.logoutTime ? 'Checked Out' : 'Check Out'}
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Absent
                            </span>
                            <button
                              onClick={() => handleCheckIn(emp.id)}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                              Check In
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reports Tab Component
  const ReportsTab = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('attendance');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const generateReport = async () => {
  setLoading(true);
  try {
    let endpoint = '';
    const params = new URLSearchParams();
    
    if (reportType === 'attendance') {
      endpoint = '/employees/stats/attendance';
      if (selectedMonth) params.append('month', selectedMonth.toString());
      if (selectedYear) params.append('year', selectedYear.toString());
    } else if (reportType === 'salary') {
      endpoint = '/employees/salary/summary/' + selectedMonth + '/' + selectedYear;
    }
    
    const finalEndpoint = endpoint + (params.toString() ? '?' + params.toString() : '');
    console.log('Generating report with endpoint:', finalEndpoint);
    
    const data = await apiCall(finalEndpoint);
    console.log('Report data received:', data);
    
    setReportData(data.data || data);
  } catch (error) {
    console.error('Report generation error:', error);
    alert('Failed to generate report: ' + error.message);
  } finally {
    setLoading(false);
  }
};


    useEffect(() => {
      generateReport();
    }, [reportType, selectedMonth, selectedYear]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
            <p className="text-gray-600">Generate comprehensive reports and insights</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={generateReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="attendance">Attendance Report</option>
                <option value="salary">Salary Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={2020 + i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Data */}
        {reportData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {reportType === 'attendance' ? 'Average Attendance' : 'Total Payroll'}
                  </h3>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {reportType === 'attendance' 
                    ? `${reportData.overallStats?.averageAttendance || 0}%`
                    : `₹${reportData.summary?.totalPayroll?.toLocaleString() || 0}`
                  }
                </p>
                <p className="text-sm text-gray-600">This period</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {reportType === 'attendance' ? 'Total Hours' : 'Average Salary'}
                  </h3>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {reportType === 'attendance' 
                    ? Math.round(reportData.overallStats?.totalHours || 0)
                    : `₹${reportData.summary?.averageSalary?.toLocaleString() || 0}`
                  }
                </p>
                <p className="text-sm text-gray-600">This period</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {reportType === 'attendance' ? 'Overtime Hours' : 'Total Employees'}
                  </h3>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {reportType === 'attendance' 
                    ? Math.round(reportData.overallStats?.totalOvertimeHours || 0)
                    : reportData.summary?.totalEmployees || 0
                  }
                </p>
                <p className="text-sm text-gray-600">This period</p>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Department Breakdown</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(reportData.departmentStats || reportData.summary?.departmentBreakdown || {}).map(([dept, data]) => {
                    const percentage = reportType === 'attendance' 
                      ? data.averageAttendance || 0
                      : Math.round((data.employees / reportData.summary.totalEmployees) * 100);
                    
                    return (
                      <div key={dept} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="font-medium text-gray-700 capitalize">{dept}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {reportType === 'attendance' 
                              ? `${data.employees} employees, ${data.averageAttendance}% attendance`
                              : `${data.employees} employees, ₹${data.totalSalary?.toLocaleString()}`
                            }
                          </span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-12">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            {reportData.performanceMetrics?.topPerformers && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {reportData.performanceMetrics.topPerformers.slice(0, 5).map((emp, index) => (
                      <div key={emp.employeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{emp.name}</p>
                            <p className="text-sm text-gray-600">{emp.role} • {emp.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{emp.performanceScore}%</p>
                          <p className="text-sm text-gray-600">Performance Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main render
  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">Restaurant EMS</h1>
              </div>
              
              <div className="flex space-x-4">
                {[
                  { key: 'dashboard', label: 'Dashboard', icon: Home },
                  { key: 'employees', label: 'Employees', icon: Users },
                  { key: 'attendance', label: 'Attendance', icon: Clock },
                  { key: 'reports', label: 'Reports', icon: BarChart3 }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === key 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-medium text-gray-800">Restaurant Manager</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Add New Employee</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <EmployeeForm isModal={true} />
            </div>
          </div>
        </div>
      )}

    {showDetailsModal && selectedEmployee && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedEmployee.name || 'Employee'} - Employee Details
          </h2>
          <button
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedEmployee(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {selectedEmployee.email || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {selectedEmployee.phone || 'N/A'}</p>
                <p><span className="font-medium">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                <p>
                  <span className="font-medium">Join Date:</span> 
                  {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Employment Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Base Salary:</span> 
                  ₹{(selectedEmployee.salary?.base || 0).toLocaleString()}
                </p>
                <p><span className="font-medium">Payroll Type:</span> {selectedEmployee.payrollType || 'N/A'}</p>
                <p>
                  <span className="font-medium">Shift:</span> 
                  {selectedEmployee.shiftTiming?.startTime || '09:00'} - {selectedEmployee.shiftTiming?.endTime || '18:00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of the modal content with safe property access */}
        {selectedEmployee.currentMonthStats && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Current Month Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-green-600">
                  {Number(selectedEmployee.currentMonthStats.presentDays || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Number(selectedEmployee.currentMonthStats.totalHours || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Overtime</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Number(selectedEmployee.currentMonthStats.overtimeHours || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Number(selectedEmployee.currentMonthStats.attendancePercentage || 0)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent attendance section with safe rendering */}
        {Array.isArray(selectedEmployee.recentAttendance) && selectedEmployee.recentAttendance.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Recent Attendance (Last 30 days)</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {selectedEmployee.recentAttendance.slice(0, 10).map((att, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {att.isPresent ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {att.date ? new Date(att.date).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      att.status === 'present' ? 'bg-green-100 text-green-800' :
                      att.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      att.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {att.status || 'unknown'}
                    </span>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {att.isPresent && (
                      <div>
                        <div>
                          In: {att.loginTime ? new Date(att.loginTime).toLocaleTimeString('en-US', { 
                            hour12: true, hour: '2-digit', minute: '2-digit' 
                          }) : '-'}
                        </div>
                        <div>
                          Out: {att.logoutTime ? new Date(att.logoutTime).toLocaleTimeString('en-US', { 
                            hour12: true, hour: '2-digit', minute: '2-digit' 
                          }) : '-'}
                        </div>
                        <div>Hours: {Number(att.hoursWorked || 0)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

  {showSalaryModal && selectedEmployee && salaryData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Salary Details - {selectedEmployee.name}
          </h2>
          <button
            onClick={() => {
              setShowSalaryModal(false);
              setSalaryData(null);
              setSelectedEmployee(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Salary Breakdown for {salaryData.period?.monthName || 'Current Month'}
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-medium">₹{(salaryData.earnings?.baseSalary || 0).toLocaleString()}</span>
              </div>

              {(salaryData.earnings?.overtimePay || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Overtime Pay:</span>
                  <span className="font-medium">₹{(salaryData.earnings?.overtimePay || 0).toLocaleString()}</span>
                </div>
              )}

              {(salaryData.earnings?.totalAllowances || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span className="font-medium">₹{(salaryData.earnings?.totalAllowances || 0).toLocaleString()}</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              
              <div className="flex justify-between">
                <span>Gross Salary:</span>
                <span className="font-medium">₹{(salaryData.earnings?.grossSalary || 0).toLocaleString()}</span>
              </div>
              
              {(salaryData.deductions?.totalDeductions || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Deductions:</span>
                  <span className="font-medium">-₹{(salaryData.deductions?.totalDeductions || 0).toLocaleString()}</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              
              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>Net Salary:</span>
                <span>₹{(salaryData.earnings?.netSalary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-blue-600">
                {salaryData.period?.presentDays || salaryData.attendance?.presentDays || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Attendance %</p>
              <p className="text-2xl font-bold text-green-600">
                {salaryData.period?.attendancePercentage || salaryData.attendance?.attendancePercentage || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {showPayslipModal && selectedEmployee && payslipData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Payslip - {payslipData.employee?.name || selectedEmployee.name}
          </h2>
          <button
            onClick={() => {
              setShowPayslipModal(false);
              setPayslipData(null);
              setSelectedEmployee(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">Salary Slip</h3>
            <p className="text-gray-600">
              {payslipData.period?.monthName || 'Current Month'} {payslipData.period?.year || new Date().getFullYear()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Employee ID:</strong> {payslipData.employee?.employeeId || ''}</p>
              <p><strong>Name:</strong> {payslipData.employee?.name || ''}</p>
              <p><strong>Department:</strong> {payslipData.employee?.department || ''}</p>
            </div>
            <div>
              <p><strong>Working Days:</strong> {payslipData.period?.workingDays || 0}</p>
              <p><strong>Present Days:</strong> {payslipData.period?.presentDays || 0}</p>
              <p><strong>Generated On:</strong> {new Date(payslipData.generatedOn || new Date()).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Earnings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>₹{(payslipData.earnings?.basicSalary || 0).toLocaleString()}</span>
              </div>
              {(payslipData.earnings?.overtimePay || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Overtime Pay</span>
                  <span>₹{(payslipData.earnings?.overtimePay || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Earnings</span>
                <span className="font-semibold text-green-600">
                  ₹{(payslipData.earnings?.totalEarnings || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Deductions</h4>
            <div className="space-y-2 text-sm">
              {Array.isArray(payslipData.deductions) && payslipData.deductions.length > 0 ? (
                payslipData.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{deduction.name || 'Deduction'}</span>
                    <span className="text-red-600">-₹{(deduction.amount || 0).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>No deductions</span>
                  <span className="text-gray-500">₹0</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Deductions</span>
                <span className="font-semibold text-red-600">
                  -₹{(payslipData.totalDeductions || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4">
            <span className="font-semibold">Net Pay</span>
            <span className="font-semibold text-green-600">
              ₹{(payslipData.netPay || 0).toLocaleString()}
            </span>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Generated by Restaurant EMS</p>
            <p>For any queries, contact HR.</p>
            <p className="text-gray-400">HR Email: hr@restaurant.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>

    

  );
}
  export default EmployeeManagementSystem;