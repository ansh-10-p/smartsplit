import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Shield,
    Bell,
    Palette,
    Camera,
    Edit2,
    Save,
    X,
    Check,
    TrendingUp,
    Users,
    Receipt,
    Award,
} from "lucide-react";
import { AuthContext } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NumberFlow from "@number-flow/react";

const PROFILE_KEY = "smartsplit_profile_v1";
const EXP_KEY = "smartsplit_expenses_v1";
const GROUP_KEY = "smartsplit_groups_v1";

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem(PROFILE_KEY);
        return saved
            ? JSON.parse(saved)
            : {
                name: user?.name || "User",
                email: user?.email || "user@smartsplit.com",
                phone: "",
                bio: "",
                location: "",
                avatar: "",
                upiId: "",
                joinDate: new Date().toISOString(),
                preferences: {
                    currency: "INR",
                    language: "en",
                    timezone: "Asia/Kolkata",
                },
            };
    });

    const [editForm, setEditForm] = useState(profile);

    useEffect(() => {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }, [profile]);

    const handleSave = () => {
        setProfile(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm(profile);
        setIsEditing(false);
    };

    // Calculate stats
    const expenses = JSON.parse(localStorage.getItem(EXP_KEY) || "[]");
    const groups = JSON.parse(localStorage.getItem(GROUP_KEY) || "[]");
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalGroups = groups.length;
    const totalTransactions = expenses.length;
    const memberSince = new Date(profile.joinDate).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "personal", label: "Personal Info", icon: Mail },
        { id: "payment", label: "Payment Methods", icon: CreditCard },
        { id: "preferences", label: "Preferences", icon: Palette },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
            {/* Header with Cover Photo */}
            <div className="relative h-48 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-20">
                {/* Profile Card */}
                <Card className="relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-2xl mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Avatar */}
                            <div className="relative">
                                <motion.div
                                    className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </motion.div>
                                <motion.button
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200 dark:border-slate-700"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Camera className="w-5 h-5 text-purple-600" />
                                </motion.button>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                                        <p className="text-muted-foreground mt-1">{profile.email}</p>
                                        {profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-md">{profile.bio}</p>}
                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            {profile.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {profile.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Joined {memberSince}
                                            </div>
                                        </div>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {isEditing ? (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            ) : (
                                                <>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit Profile
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <motion.div
                                className="text-center p-4 backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200/60 dark:border-purple-700/60"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Receipt className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                                </motion.div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                                    <NumberFlow value={totalTransactions} />
                                </div>
                                <div className="text-sm text-muted-foreground">Transactions</div>
                            </motion.div>
                            <motion.div
                                className="text-center p-4 backdrop-blur-sm bg-gradient-to-br from-cyan-50/80 to-cyan-100/80 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg border border-cyan-200/60 dark:border-cyan-700/60"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Users className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
                                </motion.div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                                    <NumberFlow value={totalGroups} />
                                </div>
                                <div className="text-sm text-muted-foreground">Groups</div>
                            </motion.div>
                            <motion.div
                                className="text-center p-4 backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200/60 dark:border-green-700/60"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                </motion.div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                    ₹<NumberFlow value={totalExpenses} format={{ notation: "compact" }} />
                                </div>
                                <div className="text-sm text-muted-foreground">Total Spent</div>
                            </motion.div>
                            <motion.div
                                className="text-center p-4 backdrop-blur-sm bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200/60 dark:border-yellow-700/60"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Award className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                                </motion.div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                                    <NumberFlow value={Math.floor(totalTransactions * 10)} />
                                </div>
                                <div className="text-sm text-muted-foreground">Karma Points</div>
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "default" : "outline"}
                            onClick={() => setActiveTab(tab.id)}
                            className={
                                activeTab === tab.id
                                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                                    : ""
                            }
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "overview" && (
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Your latest actions on SmartSplit</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {expenses.slice(0, 5).map((exp, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        <Receipt className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{exp.name || "Expense"}</p>
                                                        <p className="text-sm text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">₹{exp.amount}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "personal" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Manage your personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={isEditing ? editForm.name : profile.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={isEditing ? editForm.email : profile.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={isEditing ? editForm.phone : profile.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="+91 1234567890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={isEditing ? editForm.location : profile.location}
                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={isEditing ? editForm.bio : profile.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                    />
                                </div>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                                            <Check className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </Button>
                                        <Button onClick={handleCancel} variant="outline">
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "payment" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Manage your payment information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="upi">UPI ID</Label>
                                    <Input
                                        id="upi"
                                        value={isEditing ? editForm.upiId : profile.upiId}
                                        onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="yourname@upi"
                                    />
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-900 dark:text-blue-100">Secure Payment Information</p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                Your payment details are encrypted and never shared with third parties.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "preferences" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                                <CardDescription>Customize your experience</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Input
                                            id="currency"
                                            value={isEditing ? editForm.preferences.currency : profile.preferences.currency}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    preferences: { ...editForm.preferences, currency: e.target.value },
                                                })
                                            }
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Language</Label>
                                        <Input
                                            id="language"
                                            value={isEditing ? editForm.preferences.language : profile.preferences.language}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    preferences: { ...editForm.preferences, language: e.target.value },
                                                })
                                            }
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Input
                                            id="timezone"
                                            value={isEditing ? editForm.preferences.timezone : profile.preferences.timezone}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    preferences: { ...editForm.preferences, timezone: e.target.value },
                                                })
                                            }
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
