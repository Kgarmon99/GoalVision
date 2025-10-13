import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  monthlyBurnRate: z.coerce.number().min(0),
  currentCash: z.coerce.number().min(0),
});

type SettingsData = z.infer<typeof formSchema>;

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyBurnRate: 250000,
      currentCash: 1000000,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        form.reset(settings);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, [form]);

  const onSubmit = (data: SettingsData) => {
    localStorage.setItem('dashboard-settings', JSON.stringify(data));
    window.dispatchEvent(new Event('settings-updated'));
    toast({
      title: "Settings saved",
      description: "Your financial settings have been updated.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-primary/40 text-white hover:bg-primary/20"
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-primary/40 text-white">
        <DialogHeader>
          <DialogTitle className="text-glow">Financial Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentCash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Cash ($)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01"
                      className="bg-black/60 border-primary/30"
                      data-testid="input-current-cash"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 text-xs">
                    Total cash available in your account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyBurnRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Burn Rate ($)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01"
                      className="bg-black/60 border-primary/30"
                      data-testid="input-burn-rate"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 text-xs">
                    How much cash you spend per month
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="text-sm text-gray-300">
                <div className="flex justify-between mb-2">
                  <span>Runway:</span>
                  <span className="text-primary font-bold text-glow">
                    {((form.watch('currentCash') || 0) / (form.watch('monthlyBurnRate') || 1)).toFixed(1)} months
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Calculated as: Current Cash ÷ Monthly Burn Rate
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-primary/30"
                data-testid="button-cancel-settings"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-black hover:bg-primary/90"
                data-testid="button-save-settings"
              >
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}