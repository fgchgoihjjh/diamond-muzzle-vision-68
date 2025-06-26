
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Phone, MessageCircle, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { userProfileSchema, validateAndSanitize, searchSchema } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

interface User {
  id: string;
  email?: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  telegram_id?: number;
  status: string;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  is_premium?: boolean;
  subscription_plan?: string;
}

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
  loading: boolean;
}

type UserFormData = z.infer<typeof userProfileSchema>;

export function UserManagement({ users, onRefresh, loading }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      telegram_id: "",
      status: "active",
      subscription_plan: "free",
      is_premium: false,
    },
  });

  // Validate search input
  const handleSearchChange = (value: string) => {
    try {
      const validated = searchSchema.parse({ query: value });
      setSearchTerm(validated.query);
    } catch (error) {
      // Invalid search input, ignore
      console.warn("Invalid search input");
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return `${user.first_name} ${user.last_name || ''}`.toLowerCase().includes(searchLower) ||
           user.phone_number?.includes(searchTerm) ||
           user.telegram_id?.toString().includes(searchTerm);
  });

  const handleEdit = (user: User) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit users",
        variant: "destructive",
      });
      return;
    }

    setEditingUser(user);
    form.reset({
      first_name: user.first_name,
      last_name: user.last_name || "",
      phone_number: user.phone_number || "",
      telegram_id: user.telegram_id?.toString() || "",
      status: user.status as "active" | "inactive" | "suspended",
      subscription_plan: (user.subscription_plan || "free") as "free" | "premium" | "enterprise",
      is_premium: user.is_premium || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete users",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage users",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate and sanitize input data
      const sanitizedData = validateAndSanitize(userProfileSchema, data);
      
      const userData = {
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name || null,
        phone_number: sanitizedData.phone_number || null,
        telegram_id: sanitizedData.telegram_id ? parseInt(sanitizedData.telegram_id) : null,
        status: sanitizedData.status,
        subscription_plan: sanitizedData.subscription_plan,
        is_premium: sanitizedData.is_premium,
      };

      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update(userData)
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user
        const { error } = await supabase
          .from('user_profiles')
          .insert([userData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "User added successfully",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingUser(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingUser ? 'update' : 'add'} user`,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update user status",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User status updated successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingUser(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telegram_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telegram ID</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subscription_plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Update User' : 'Add User'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.phone_number && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.telegram_id && (
                        <div className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {user.telegram_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(value) => handleStatusChange(user.id, value)}
                        disabled={!isAuthenticated}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_premium ? 'default' : 'outline'}>
                        {user.subscription_plan || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                          disabled={!isAuthenticated}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          disabled={!isAuthenticated}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
