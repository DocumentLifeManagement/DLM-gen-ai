import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import Button from "../../components/landing/Button";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import clsx from "clsx";

export default function UserManagement({ navigate }) {
  const userRole = "admin";

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);

  // ✅ Form State (role starts empty)
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "",
  });

  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // ✅ Role validation added
    if (!formData.role) {
      showToast("Please select a role", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create user");
      }

      showToast(`User ${formData.email} created successfully`);

      // ✅ Reset back to placeholder
      setFormData({ email: "", password: "", role: "" });

      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (
      !window.confirm(
        `Are you sure you want to terminate authorization for ${userEmail}?`,
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete user");
      }

      showToast(`Authorization for ${userEmail} terminated.`);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const updatePayload = {
        full_name: editingUser.full_name,
        role: editingUser.role,
      };
      if (editingUser.password) {
        updatePayload.password = editingUser.password;
      }

      const res = await fetch(
        `http://localhost:8000/api/v1/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update user");
      }

      showToast(`User ${editingUser.email} updated successfully`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const startEditing = (user) => {
    setEditingUser({
      ...user,
      password: "", // Don't show hashed password, allow reset
    });
    setShowAddForm(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout
        role={userRole}
        navigate={navigate}
        title="User Administration"
      >
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 text-sm">
            Loading security directory...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role={userRole}
      navigate={navigate}
      title="IAM & Security Control"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">
            Fleet Personnel
          </h2>
          <p className="text-slate-500 text-sm">
            Manage access rights and security clearances for all users.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingUser(null);
          }}
          className={clsx(
            "flex items-center gap-3 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0",
            showAddForm
              ? "bg-slate-800 text-slate-400 hover:text-white"
              : "bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:scale-[1.02]",
          )}
        >
          {showAddForm ? <XCircle size={16} /> : <UserPlus size={16} />}
          {showAddForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {editingUser && (
        <div className="mb-10">
          <div className="bg-brand-900 border border-brand-cyan/30 rounded-2xl p-5 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-xs font-black text-brand-cyan uppercase tracking-[0.3em] mb-6">
              Edit: {editingUser.email}
            </h3>

            <form
              onSubmit={handleUpdateUser}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 items-end"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={editingUser.full_name || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full bg-brand-950 border border-brand-800 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-brand-accent transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={editingUser.password}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        password: e.target.value,
                      })
                    }
                    className="w-full bg-brand-950 border border-brand-800 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-brand-accent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showEditPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Role
                </label>
                <select
                  className="w-full bg-brand-950 border border-brand-800 rounded-lg py-3.5 px-4 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="APPROVER">Approver</option>
                  <option value="UPLOADER">Uploader</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 !py-4"
                  disabled={formLoading}
                >
                  {formLoading ? "Saving..." : "Save Changes"}
                </Button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-slate-800 text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-10">
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-xs font-black text-brand-accent uppercase tracking-[0.3em] mb-6">
              Authorization Protocol
            </h3>

            <form
              onSubmit={handleAddUser}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 items-end"
            >
              {/* Email */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@dlm.io"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-brand-950 border border-brand-800 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-brand-accent transition-all"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Employee Name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full bg-brand-950 border border-brand-800 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-brand-accent transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Key size={12} /> Security Credential
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-brand-950 border border-brand-800 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-brand-accent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Shield size={12} /> Role
                </label>

                <div className="flex gap-4">
                  <select
                    className="w-full bg-brand-950 border border-brand-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="">Choose a role...</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="APPROVER">Approver</option>
                  </select>

                  <Button
                    type="submit"
                    variant="primary"
                    className="shrink-0 !py-4"
                    disabled={formLoading}
                  >
                    {formLoading ? "Deploying..." : "Authorize"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-brand-800 bg-brand-900/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  User
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Security Level
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-800/50">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-brand-accent text-xs font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">
                          {user.full_name || "N/A"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-brand-800 text-brand-accent px-2.5 py-1 rounded-md tracking-wider">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.is_active ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-rose-500" />
                          <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEditing(user)}
                        className="text-slate-500 hover:text-brand-cyan transition-colors p-2 rounded-lg hover:bg-brand-cyan/10"
                        title="Edit Credentials"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-rose-400/10"
                        title="Revoke Access"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <AlertCircle
                      size={40}
                      className="mx-auto text-slate-700 mb-4 opacity-20"
                    />
                    <p className="text-slate-500 font-medium">
                      No personnel detected in the current sector.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={clsx(
            "fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 border",
            toast.type === "error"
              ? "bg-rose-900 border-rose-700 text-rose-100"
              : "bg-emerald-900 border-emerald-700 text-emerald-100",
          )}
        >
          {toast.type === "error" ? (
            <XCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <span className="text-sm font-bold tracking-tight">{toast.msg}</span>
        </div>
      )}
    </DashboardLayout>
  );
}
