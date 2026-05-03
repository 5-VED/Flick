import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import * as mock from '../data/mockData';

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const [user, setUser] = useState(() => adminService.getStoredUser());
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState(mock.customers);
  const [riders, setRiders] = useState(mock.riders);
  const [rides, setRides] = useState(mock.rides);
  const [disputes, setDisputes] = useState(mock.disputes);
  const [loading, setLoading] = useState({});

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  const login = useCallback(async (email, password) => {
    const result = await adminService.login(email, password);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    adminService.logout();
    setUser(null);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoad('stats', true);
    try {
      const r = await adminService.getStats();
      if (r.success) setStats(r.data);
    } catch {}
    setLoad('stats', false);
  }, []);

  const fetchCustomers = useCallback(async (params) => {
    setLoad('customers', true);
    try {
      const r = await adminService.getCustomers(params);
      if (r.success && r.data.length > 0) setCustomers(r.data);
    } catch {}
    setLoad('customers', false);
  }, []);

  const fetchRiders = useCallback(async (params) => {
    setLoad('riders', true);
    try {
      const r = await adminService.getRiders(params);
      if (r.success && r.data.length > 0) setRiders(r.data);
    } catch {}
    setLoad('riders', false);
  }, []);

  const fetchRides = useCallback(async (params) => {
    setLoad('rides', true);
    try {
      const r = await adminService.getRides(params);
      if (r.success && r.data.length > 0) setRides(r.data);
    } catch {}
    setLoad('rides', false);
  }, []);

  const fetchDisputes = useCallback(async (params) => {
    setLoad('disputes', true);
    try {
      const r = await adminService.getDisputes(params);
      if (r.success && r.data.length > 0) setDisputes(r.data);
    } catch {}
    setLoad('disputes', false);
  }, []);

  const updateCustomerStatus = useCallback(async (userId, isActive) => {
    try {
      await adminService.updateUserStatus(userId, isActive);
      setCustomers(prev => prev.map(c =>
        (c._id === userId || c.id === userId) ? { ...c, is_active: isActive, status: isActive ? 'Active' : 'Blocked' } : c
      ));
    } catch {}
  }, []);

  const verifyRider = useCallback(async (riderId, isVerified) => {
    try {
      await adminService.verifyRider(riderId, isVerified);
      setRiders(prev => prev.map(r =>
        (r._id === riderId || r.id === riderId) ? { ...r, doc_verified: isVerified, docVerified: isVerified } : r
      ));
    } catch {}
  }, []);

  const resolveDispute = useCallback(async (disputeId, status, note) => {
    try {
      await adminService.resolveDispute(disputeId, status, note);
      setDisputes(prev => prev.map(d =>
        (d._id === disputeId || d.id === disputeId) ? { ...d, status } : d
      ));
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchCustomers();
      fetchRiders();
      fetchRides();
      fetchDisputes();
    }
  }, [user]);

  return (
    <AdminContext.Provider value={{
      user, login, logout,
      stats, customers, riders, rides, disputes,
      loading,
      fetchStats, fetchCustomers, fetchRiders, fetchRides, fetchDisputes,
      updateCustomerStatus, verifyRider, resolveDispute,
      mockData: mock,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
  