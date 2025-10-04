-- Create enum for communication channels
CREATE TYPE public.communication_channel AS ENUM ('email', 'sms', 'paper', 'portal');

-- Create enum for billing cycle frequency
CREATE TYPE public.billing_frequency AS ENUM ('weekly', 'bi_weekly', 'monthly', 'quarterly');

-- Create enum for statement status
CREATE TYPE public.statement_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'viewed', 'paid');

-- Create enum for chat status
CREATE TYPE public.chat_status AS ENUM ('active', 'resolved', 'escalated', 'closed');

-- Billing cycles configuration table
CREATE TABLE public.billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  frequency public.billing_frequency NOT NULL DEFAULT 'monthly',
  day_of_cycle INTEGER NOT NULL DEFAULT 1,
  reminder_days INTEGER[] DEFAULT ARRAY[15, 30, 60],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Patient communication preferences
CREATE TABLE public.patient_communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  preferred_channel public.communication_channel NOT NULL DEFAULT 'email',
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  paper_enabled BOOLEAN DEFAULT false,
  portal_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id)
);

-- Billing statements tracking
CREATE TABLE public.billing_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  statement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  amount_due DECIMAL(10,2) NOT NULL,
  status public.statement_status DEFAULT 'pending',
  channel public.communication_channel,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  error_message TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment reminders queue
CREATE TABLE public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID REFERENCES public.billing_statements(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  channel public.communication_channel NOT NULL,
  status public.statement_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat conversations
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  status public.chat_status DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT true,
  sender_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (open for now, can be restricted based on user roles later)
CREATE POLICY "Allow all operations on billing_cycles" ON public.billing_cycles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on patient_communication_preferences" ON public.patient_communication_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on billing_statements" ON public.billing_statements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payment_reminders" ON public.payment_reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chat_conversations" ON public.chat_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_billing_statements_patient_id ON public.billing_statements(patient_id);
CREATE INDEX idx_billing_statements_status ON public.billing_statements(status);
CREATE INDEX idx_payment_reminders_scheduled_for ON public.payment_reminders(scheduled_for);
CREATE INDEX idx_chat_conversations_patient_id ON public.chat_conversations(patient_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_billing_cycles_updated_at BEFORE UPDATE ON public.billing_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patient_communication_preferences_updated_at BEFORE UPDATE ON public.patient_communication_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_billing_statements_updated_at BEFORE UPDATE ON public.billing_statements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();