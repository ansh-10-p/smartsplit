import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Users,
  Wallet,
  ArrowLeft,
  X,
  BarChart3,
  Filter,
  Download,
  CreditCard,
  Calculator,
  UserPlus,
  Search,
  Check as CheckIcon,
  ChevronsUpDown,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../App";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const GROUP_KEY = "smartsplit_groups_v1";
const PART_KEY_V1 = "smartsplit_participants_v1";
const PART_KEY_LEGACY = "smartsplit_participants";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toFixed2(n) {
  return Math.round(n * 100) / 100;
}

export default function Group() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const [participants, setParticipants] = useState(() => {
    return (
      loadLocal(PART_KEY_V1, null) ||
      loadLocal(PART_KEY_LEGACY, null) || [
        { id: "p_you", name: user?.username || "You" },
        { id: "p_alice", name: "Alice" },
        { id: "p_bob", name: "Bob" },
      ]
    );
  });
  useEffect(() => saveLocal(PART_KEY_V1, participants), [participants]);

  const participantIdToParticipant = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = p));
    return map;
  }, [participants]);

  const nameToParticipant = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.name.toLowerCase()] = p));
    return map;
  }, [participants]);

  const displayName = (keyOrName) => {
    if (!keyOrName) return "Unknown";
    const p = participantIdToParticipant[keyOrName];
    if (p) return p.name;
    return keyOrName;
  };

  const addParticipantByName = (rawName) => {
    const name = (rawName || "").trim();
    if (!name) return null;
    const exists =
      participants.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
    if (exists) return exists;
    const p = { id: uid("p"), name };
    setParticipants((prev) => [p, ...prev]);
    return p;
  };

  const [groups, setGroups] = useState(() => loadLocal(GROUP_KEY, []));
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("Friends");

  // Add Expense Form State
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePayer, setExpensePayer] = useState("");
  const [expenseSplitType, setExpenseSplitType] = useState("equal");

  const [filterMember, setFilterMember] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    saveLocal(GROUP_KEY, groups);
  }, [groups]);

  useEffect(() => {
    const paid = params.get("paid");
    const gid = params.get("gid");
    if (paid === "1") {
      showToast("Payment recorded", "success");
      if (gid) {
        const byId = groups.find((g) => `${g.id}` === `${gid}`);
        if (byId) setSelectedGroup(byId);
      }
      params.delete("paid");
      params.delete("gid");
      setParams(params, { replace: true });
    }
  }, []);

  const groupMemberKeys = (group) => group.members || [];
  const expensePayerKey = (e) => e.payerId || e.payer;

  const createGroup = () => {
    const g = {
      id: uid("grp"),
      name: newGroupName.trim() || "New Group",
      category: newGroupCategory,
      members: participants.map(p => p.id), // Default everyone for demo simplicity
      expenses: [],
      settlements: [],
      createdAt: Date.now(),
    };
    setGroups(prev => [g, ...prev]);
    setIsAddGroupOpen(false);
    setSelectedGroup(g);
    setNewGroupName("");
  };

  const addExpense = () => {
    if (!expenseTitle || !expenseAmount) return;

    setGroups((prev) => {
      const updated = prev.map((g) =>
        `${g.id}` === `${selectedGroup.id}`
          ? {
            ...g,
            expenses: [
              {
                id: uid("exp"),
                title: expenseTitle,
                amount: Number(expenseAmount),
                payerId: expensePayer || groupMemberKeys(selectedGroup)[0],
                splitType: expenseSplitType,
                createdAt: Date.now(),
              },
              ...g.expenses,
            ],
          }
          : g
      );
      const sel = updated.find((gg) => `${gg.id}` === `${selectedGroup.id}`);
      setSelectedGroup(sel || null);
      return updated;
    });
    setIsAddExpenseOpen(false);
    setExpenseTitle("");
    setExpenseAmount("");
  };

  const totalSpent = (group) =>
    (group.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // ... (Retain existing complex settlement logic if needed, simplified for UI demo)

  return (
    <div className="p-6 min-h-screen pt-24 bg-background text-foreground transition-colors">
      <div className="max-w-7xl mx-auto">
        {!selectedGroup && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">My Groups</h1>
                <p className="text-muted-foreground">Manage expenses with different circles of friends.</p>
              </div>
              <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                    <PlusCircle size={18} /> Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>Start a new group to split expenses.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Group Name</Label>
                      <Input
                        placeholder="Trip to Goa"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newGroupCategory} onValueChange={setNewGroupCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Friends">Friends</SelectItem>
                          <SelectItem value="Trip">Trip</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createGroup}>Create Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {groups.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No groups yet</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                  Create a group to start tracking shared expenses with your friends or family.
                </p>
                <Button onClick={() => setIsAddGroupOpen(true)}>Create your first group</Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((g) => (
                  <Card
                    key={g.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                    onClick={() => setSelectedGroup(g)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl font-bold">{g.name}</CardTitle>
                      <Badge variant="outline">{g.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex -space-x-2 overflow-hidden">
                          {groupMemberKeys(g).slice(0, 4).map((m) => (
                            <div key={m} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold uppercase">
                              {displayName(m).charAt(0)}
                            </div>
                          ))}
                          {groupMemberKeys(g).length > 4 && (
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-medium">
                              +{groupMemberKeys(g).length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 justify-between items-center text-sm text-muted-foreground">
                      <span>{g.expenses?.length || 0} expenses</span>
                      <span className="font-semibold text-primary">₹{totalSpent(g).toFixed(0)}</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {selectedGroup && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" className="gap-2" onClick={() => setSelectedGroup(null)}>
                <ArrowLeft size={16} /> Back to Groups
              </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {selectedGroup.name}
                  <Badge variant="secondary" className="text-base font-normal">{selectedGroup.category}</Badge>
                </h1>
                <p className="text-muted-foreground mt-1">
                  {groupMemberKeys(selectedGroup).length} members • Total spent ₹{totalSpent(selectedGroup).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PlusCircle size={16} /> Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} placeholder="Dinner at Taj" />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Paid By</Label>
                        <Select value={expensePayer} onValueChange={setExpensePayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payer" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupMemberKeys(selectedGroup).map(m => (
                              <SelectItem key={m} value={m}>{displayName(m)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addExpense}>Save Expense</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="gap-2">
                  <Calculator size={16} /> Settle Up
                </Button>
              </div>
            </div>

            {/* Expenses List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8 w-[200px]"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(selectedGroup.expenses || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No expenses yet. Add one to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedGroup.expenses || []).filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())).map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <div className="font-medium">{e.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {displayName(expensePayerKey(e))} paid
                            </div>
                          </div>
                        </div>
                        <div className="font-bold">
                          ₹{Number(e.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5">
          {toast.text}
        </div>
      )}
    </div>
  );
}