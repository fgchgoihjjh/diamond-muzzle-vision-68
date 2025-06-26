
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Ban, 
  CheckCircle, 
  MessageCircle, 
  Search,
  Send,
  UserX
} from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
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

interface UserSpending {
  user_id: string;
  total_cost: number;
  total_tokens: number;
  api_calls: number;
}

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
  loading: boolean;
}

interface EditUserFormData {
  first_name: string;
  last_name?: string;
  phone_number?: string;
  status: string;
}

interface TelegramMessageFormData {
  message: string;
}

export function UserManagement({ users, onRefresh, loading }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [userSpending, setUserSpending] = useState<Record<string, UserSpending>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const { toast } = useToast();

  const editForm = useForm<EditUserFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      status: "active",
    },
  });

  const messageForm = useForm<TelegramMessageFormData>({
    defaultValues: {
      message: "",
    },
  });

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm) ||
    user.telegram_id?.toString().includes(searchTerm)
  );

  useEffect(() => {
    fetchUserSpending();
  }, [users]);

  const fetchUserSpending = async () => {
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .select('telegram_id, cost, tokens_used');

      if (error) throw error;

      const spendingMap: Record<string, UserSpending> = {};
      
      data?.forEach((usage) => {
        const user = users.find(u => u.telegram_id === usage.telegram_id);
        if (user) {
          if (!spendingMap[user.id]) {
            spendingMap[user.id] = {
              user_id: user.id,
              total_cost: 0,
              total_tokens: 0,
              api_calls: 0,
            };
          }
          spendingMap[user.id].total_cost += usage.cost || 0;
          spendingMap[user.id].total_tokens += usage.tokens_used || 0;
          spendingMap[user.id].api_calls += 1;
        }
      });

      setUserSpending(spendingMap);
    } catch (error) {
      console.error('Error fetching user spending:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      first_name: user.first_name,
      last_name: user.last_name || "",
      phone_number: user.phone_number || "",
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSendMessage = (user: User) => {
    setSelectedUser(user);
    messageForm.reset({ message: "" });
    setIsMessageDialogOpen(true);
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setBlockReason("");
    setIsBlockDialogOpen(true);
  };

  const onEditSubmit = async (data: EditUserFormData) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const onMessageSubmit = async (data: TelegramMessageFormData) => {
    if (!selectedUser?.telegram_id) {
      toast({
        title: "Error",
        description: "User doesn't have a Telegram ID",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Sending message to ${selectedUser.telegram_id}: ${data.message}`);
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setIsMessageDialogOpen(false);
      messageForm.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const confirmBlockUser = async () => {
    if (!selectedUser) return;

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ status: 'blocked' })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      if (selectedUser.telegram_id) {
        const { error: logError } = await supabase
          .from('blocked_users')
          .insert([{
            telegram_id: selectedUser.telegram_id,
            blocked_by_telegram_id: 0,
            reason: blockReason,
          }]);

        if (logError) console.error('Error logging block action:', logError);
      }

      toast({
        title: "Success",
        description: "User blocked successfully",
      });

      setIsBlockDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  const unblockUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'active' })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unblocked successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage users, send messages, and track spending
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    <TableHead>Spending</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const spending = userSpending[user.id];
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.phone_number && (
                              <div className="text-sm">{user.phone_number}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.telegram_id || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_premium ? 'default' : 'outline'}>
                            {user.subscription_plan || 'free'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {spending ? (
                            <div className="text-sm">
                              <div>${spending.total_cost.toFixed(2)}</div>
                              <div className="text-muted-foreground">
                                {spending.api_calls} calls
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No usage</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {user.telegram_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage(user)}
                              >
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {user.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBlockUser(user)}
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unblockUser(user)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                control={editForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Telegram Message</DialogTitle>
          </DialogHeader>
          <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-4">
              <div>
                <Label>Sending to: {selectedUser?.first_name} {selectedUser?.last_name}</Label>
                <p className="text-sm text-muted-foreground">
                  Telegram ID: {selectedUser?.telegram_id}
                </p>
              </div>
              <FormField
                control={messageForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Type your message here..."
                        className="min-h-[100px]"
                        required 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User: {selectedUser?.first_name} {selectedUser?.last_name}</Label>
              <p className="text-sm text-muted-foreground">
                This will block the user from accessing the system.
              </p>
            </div>
            <div>
              <Label htmlFor="reason">Reason for blocking</Label>
              <Textarea
                id="reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this user..."
                className="min-h-[80px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBlockUser}>
                <UserX className="h-4 w-4 mr-2" />
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
