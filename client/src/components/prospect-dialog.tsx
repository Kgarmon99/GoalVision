import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProspectSchema, type Prospect } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertProspectSchema.extend({
  value: z.coerce.number().min(0),
  probability: z.coerce.number().min(0).max(100),
  priority: z.coerce.number().min(0),
});

type ProspectDialogProps = {
  prospect?: Prospect;
  trigger?: React.ReactNode;
};

export function ProspectDialog({ prospect, trigger }: ProspectDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: prospect?.name || "",
      organization: prospect?.organization || "",
      value: prospect?.value || 0,
      probability: prospect?.probability || 50,
      stage: prospect?.stage || "initial",
      expectedCloseDate: prospect?.expectedCloseDate || "",
      notes: prospect?.notes || "",
      priority: prospect?.priority || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("/api/prospects", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects/top/10'] });
      toast({
        title: "Prospect created",
        description: "Your prospect has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prospect.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest(`/api/prospects/${prospect?.id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects/top/10'] });
      toast({
        title: "Prospect updated",
        description: "Your prospect has been updated successfully.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prospect.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/prospects/${prospect?.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects/top/10'] });
      toast({
        title: "Prospect deleted",
        description: "Your prospect has been deleted successfully.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete prospect.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (prospect) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className="glow-button bg-primary/20 border-primary/40 hover:bg-primary/30" 
            data-testid={prospect ? "button-edit-prospect" : "button-add-prospect"}
          >
            {prospect ? (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Prospect
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black border-primary/40 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-glow">
            {prospect ? "Edit Prospect" : "Add New Prospect"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="John Doe" 
                      className="bg-black/60 border-primary/30"
                      data-testid="input-prospect-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Acme Corp" 
                      className="bg-black/60 border-primary/30"
                      data-testid="input-prospect-org"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Value ($)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01"
                        className="bg-black/60 border-primary/30"
                        data-testid="input-prospect-value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probability (%)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0" 
                        max="100"
                        className="bg-black/60 border-primary/30"
                        data-testid="input-prospect-probability"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/60 border-primary/30" data-testid="select-prospect-stage">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-primary/40 text-white">
                        <SelectItem value="initial">Initial Contact</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal Sent</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                        className="bg-black/60 border-primary/30"
                        data-testid="input-prospect-close-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority (higher = more important)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      className="bg-black/60 border-primary/30"
                      data-testid="input-prospect-priority"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      value={field.value || ''}
                      placeholder="Additional details..."
                      className="bg-black/60 border-primary/30 min-h-[100px]"
                      data-testid="input-prospect-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between pt-4">
              {prospect && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-prospect"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-primary/30"
                  data-testid="button-cancel-prospect"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-black hover:bg-primary/90"
                  data-testid="button-submit-prospect"
                >
                  {isPending ? "Saving..." : prospect ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}