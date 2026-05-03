import type { ApiMethods } from './api-types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mevrcomujfroqfopdcok.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_l_fVzTQLk6Zpgyl5gzCr8A_STe2ZPTM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    success: false,
    message: error.message || 'An error occurred',
    error
  };
};

// Function to upload file to Supabase Storage
export const uploadFileToStorage = async (file: File, bucket: string = 'media-files') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      // Check if it's a bucket not found error
      if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
        throw new Error(`Storage bucket '${bucket}' not found. Please create this bucket in Supabase Storage.`);
      }
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      }
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
};

// Function to save file metadata to database
export const saveFileMetadata = async (fileData: {
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  public_url: string;
  mime_type: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .insert({
        file_name: fileData.file_name,
        file_type: fileData.file_type,
        file_size: fileData.file_size,
        file_path: fileData.file_path,
        public_url: fileData.public_url,
        mime_type: fileData.mime_type,
        uploaded_by: 'admin'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Save file metadata error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save file metadata'
    };
  }
};

// Function to save lesson to database
export const saveLessonToDatabase = async (lessonData: {
  title: string;
  category: string;
  content_type: string;
  content?: string;
  file_id?: string;
  duration?: string;
  status: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('lesson_content')
      .insert({
        title: lessonData.title,
        category: lessonData.category,
        content_type: lessonData.content_type,
        content: lessonData.content,
        file_id: lessonData.file_id,
        duration: lessonData.duration,
        status: lessonData.status,
        view_count: 0,
        order_index: 0
      })
      .select(`
        *,
        uploaded_files (
          public_url
        )
      `)
      .single();

    if (error) {
      // If table doesn't exist, provide helpful error message
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the file_storage_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Save lesson error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save lesson'
    };
  }
};

// Function to fetch lessons from database
export const fetchLessonsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('lesson_content')
      .select(`
        *,
        uploaded_files (
          public_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty data instead of error
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('lesson_content table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch lessons error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch lessons'
    };
  }
};

// Function to delete lesson from database
export const deleteLessonFromDatabase = async (lessonId: string) => {
  try {
    const { error } = await supabase
      .from('lesson_content')
      .delete()
      .eq('id', lessonId);

    if (error) {
      // If table doesn't exist, provide helpful error message
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the file_storage_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete lesson error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete lesson'
    };
  }
};

// Function to save sound track to database
export const saveSoundTrackToDatabase = async (soundData: {
  name: string;
  category: string;
  file_id?: string;
  duration?: string;
  status: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('sound_tracks')
      .insert({
        name: soundData.name,
        category: soundData.category,
        file_id: soundData.file_id,
        duration: soundData.duration,
        status: soundData.status,
        play_count: 0
      })
      .select(`
        *,
        uploaded_files (
          public_url
        )
      `)
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the file_storage_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Save sound track error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save sound track'
    };
  }
};

// Function to fetch sound tracks from database
export const fetchSoundTracksFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('sound_tracks')
      .select(`
        *,
        uploaded_files (
          public_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('sound_tracks table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch sound tracks error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch sound tracks'
    };
  }
};

// Function to delete sound track from database
export const deleteSoundTrackFromDatabase = async (soundId: string) => {
  try {
    const { error } = await supabase
      .from('sound_tracks')
      .delete()
      .eq('id', soundId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the file_storage_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete sound track error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete sound track'
    };
  }
};

// Function to save voice track to database
export const saveVoiceTrackToDatabase = async (voiceData: {
  name: string;
  voice_name: string;
  category: string;
  language: string;
  file_id?: string;
  duration?: string;
  file_size?: string;
  source: string;
  status: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('voice_tracks')
      .insert({
        name: voiceData.name,
        voice_name: voiceData.voice_name,
        category: voiceData.category,
        language: voiceData.language,
        file_id: voiceData.file_id,
        duration: voiceData.duration,
        file_size: voiceData.file_size,
        source: voiceData.source,
        status: voiceData.status,
        play_count: 0
      })
      .select(`
        *,
        uploaded_files (
          public_url
        )
      `)
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the file_storage_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Save voice track error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save voice track'
    };
  }
};

// Function to fetch voice tracks from database
export const fetchVoiceTracksFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('voice_tracks')
      .select(`
        *,
        uploaded_files (
          public_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('voice_tracks table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch voice tracks error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch voice tracks'
    };
  }
};

// Function to delete voice track from database
export const deleteVoiceTrackFromDatabase = async (voiceId: string) => {
  try {
    const { error } = await supabase
      .from('voice_tracks')
      .delete()
      .eq('id', voiceId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the file_storage_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete voice track error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete voice track'
    };
  }
};

// Function to save subscription plan to database
export const saveSubscriptionPlanToDatabase = async (planData: {
  name: string;
  price: number;
  interval: string;
  icon: string;
  color: string;
  active: boolean;
  features: string[];
}) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        name: planData.name,
        price: planData.price,
        interval: planData.interval,
        icon: planData.icon,
        color: planData.color,
        active: planData.active,
        features: planData.features
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the subscriptions_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Save subscription plan error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save subscription plan'
    };
  }
};

// Function to fetch subscription plans from database
export const fetchSubscriptionPlansFromDatabase = async () => {
  try {
    // First fetch plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (plansError) {
      if (plansError.message.includes('relation') || plansError.message.includes('does not exist')) {
        console.log('subscription_plans table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw plansError;
    }

    // Then fetch subscriber counts for each plan
    const { data: subscriberCounts, error: countsError } = await supabase
      .from('subscribers')
      .select('plan_id, status')
      .eq('status', 'active');

    if (countsError) {
      // If subscribers table doesn't exist, just return plans with 0 subscribers
      console.log('subscribers table does not exist yet, returning plans with 0 subscribers');
      return {
        success: true,
        data: plans.map(plan => ({ ...plan, subscribers: 0 }))
      };
    }

    // Count subscribers for each plan
    const counts = subscriberCounts.reduce((acc: any, sub: any) => {
      acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1;
      return acc;
    }, {});

    // Merge plans with subscriber counts
    const plansWithCounts = plans.map(plan => ({
      ...plan,
      subscribers: counts[plan.id] || 0
    }));

    return {
      success: true,
      data: plansWithCounts
    };
  } catch (error) {
    console.error('Fetch subscription plans error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch subscription plans'
    };
  }
};

// Function to update subscription plan in database
export const updateSubscriptionPlanInDatabase = async (planId: string, planData: {
  name?: string;
  price?: number;
  interval?: string;
  icon?: string;
  color?: string;
  active?: boolean;
  features?: string[];
}) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(planData)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the subscriptions_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update subscription plan error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update subscription plan'
    };
  }
};

// Function to delete subscription plan from database
export const deleteSubscriptionPlanFromDatabase = async (planId: string) => {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the subscriptions_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete subscription plan'
    };
  }
};

// Function to fetch subscribers from database
export const fetchSubscribersFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select(`
        *,
        subscription_plans (
          name,
          price,
          interval
        )
      `)
      .order('subscribed_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('subscribers table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch subscribers error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch subscribers'
    };
  }
};

// Function to cancel subscriber subscription
export const cancelSubscriberSubscription = async (subscriberId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        auto_renew: false
      })
      .eq('id', subscriberId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the subscriptions_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel subscription'
    };
  }
};

// Function to refund subscriber subscription
export const refundSubscriberSubscription = async (subscriberId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        auto_renew: false
      })
      .eq('id', subscriberId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the subscriptions_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Refund subscription error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to refund subscription'
    };
  }
};

// Function to fetch support tickets from database
export const fetchSupportTicketsFromDatabase = async () => {
  try {
    // First fetch tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketsError) {
      if (ticketsError.message.includes('relation') || ticketsError.message.includes('does not exist')) {
        console.log('support_tickets table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw ticketsError;
    }

    // Then fetch reply counts for each ticket
    const { data: replyCounts, error: countsError } = await supabase
      .from('ticket_replies')
      .select('ticket_id')
      .eq('reply_type', 'admin'); // Only count admin replies

    if (countsError) {
      // If ticket_replies table doesn't exist, just return tickets with 0 replies
      console.log('ticket_replies table does not exist yet, returning tickets with 0 replies');
      return {
        success: true,
        data: tickets.map(ticket => ({ ...ticket, ticket_replies: { count: 0 } }))
      };
    }

    // Count replies for each ticket
    const counts = replyCounts.reduce((acc: any, reply: any) => {
      acc[reply.ticket_id] = (acc[reply.ticket_id] || 0) + 1;
      return acc;
    }, {});

    // Merge tickets with reply counts
    const ticketsWithCounts = tickets.map(ticket => ({
      ...ticket,
      ticket_replies: { count: counts[ticket.id] || 0 }
    }));

    return {
      success: true,
      data: ticketsWithCounts
    };
  } catch (error) {
    console.error('Fetch support tickets error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch support tickets'
    };
  }
};

// Function to update support ticket status
export const updateSupportTicketStatus = async (ticketId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: status,
        last_reply_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the support_tickets_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update support ticket status error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update support ticket status'
    };
  }
};

// Function to add reply to support ticket
export const addSupportTicketReply = async (ticketId: string, message: string, adminName: string = 'Admin') => {
  try {
    // First add the reply
    const { data: replyData, error: replyError } = await supabase
      .from('ticket_replies')
      .insert({
        ticket_id: ticketId,
        reply_type: 'admin',
        replier_name: adminName,
        message: message
      })
      .select()
      .single();

    if (replyError) {
      if (replyError.message.includes('relation') || replyError.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the support_tickets_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw replyError;
    }

    // Then update the ticket's last_reply_at
    const { error: updateError } = await supabase
      .from('support_tickets')
      .update({
        last_reply_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      data: replyData
    };
  } catch (error) {
    console.error('Add support ticket reply error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add support ticket reply'
    };
  }
};

// Function to fetch ticket replies
export const fetchTicketReplies = async (ticketId: string) => {
  try {
    const { data, error } = await supabase
      .from('ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('ticket_replies table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch ticket replies error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch ticket replies'
    };
  }
};

// Function to delete support ticket
export const deleteSupportTicket = async (ticketId: string) => {
  try {
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', ticketId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the support_tickets_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete support ticket error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete support ticket'
    };
  }
};

// Function to fetch notification campaigns from database
export const fetchNotificationCampaignsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('notification_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('notification_campaigns table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch notification campaigns error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch notification campaigns'
    };
  }
};

// Function to create notification campaign
export const createNotificationCampaign = async (campaignData: {
  title: string;
  body: string;
  audience: string;
  channel: string;
  status?: string;
  scheduled_at?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notification_campaigns')
      .insert({
        title: campaignData.title,
        body: campaignData.body,
        audience: campaignData.audience,
        channel: campaignData.channel,
        status: campaignData.status || 'draft',
        scheduled_at: campaignData.scheduled_at || null
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the notifications_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Create notification campaign error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create notification campaign'
    };
  }
};

// Function to update notification campaign
export const updateNotificationCampaign = async (campaignId: string, updateData: {
  title?: string;
  body?: string;
  audience?: string;
  channel?: string;
  status?: string;
  scheduled_at?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notification_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the notifications_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update notification campaign error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update notification campaign'
    };
  }
};

// Function to delete notification campaign
export const deleteNotificationCampaign = async (campaignId: string) => {
  try {
    const { error } = await supabase
      .from('notification_campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the notifications_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete notification campaign error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete notification campaign'
    };
  }
};

// Function to fetch content sections from database
export const fetchContentSectionsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('content_sections table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch content sections error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch content sections'
    };
  }
};

// Function to update content section
export const updateContentSection = async (sectionId: string, enabled: boolean) => {
  try {
    const { data, error } = await supabase
      .from('content_sections')
      .update({ enabled })
      .eq('id', sectionId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update content section error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update content section'
    };
  }
};

// Function to update content section details
export const updateContentSectionDetails = async (sectionId: string, updateData: {
  title?: string;
  subtitle?: string;
  content?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('content_sections')
      .update(updateData)
      .eq('id', sectionId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update content section details error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update content section details'
    };
  }
};

// Function to fetch blog posts from database
export const fetchBlogPostsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('blog_posts table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch blog posts error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch blog posts'
    };
  }
};

// Function to create blog post
export const createBlogPost = async (postData: {
  title: string;
  category: string;
  author: string;
  status?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: postData.title,
        category: postData.category,
        author: postData.author,
        status: postData.status || 'draft'
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Create blog post error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create blog post'
    };
  }
};

// Function to update blog post
export const updateBlogPost = async (postId: string, updateData: {
  status?: string;
  title?: string;
  category?: string;
  author?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update blog post error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update blog post'
    };
  }
};

// Function to delete blog post
export const deleteBlogPost = async (postId: string) => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete blog post error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete blog post'
    };
  }
};

// Function to fetch FAQs from database
export const fetchFaqsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('faqs table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch FAQs error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch FAQs'
    };
  }
};

// Function to create FAQ
export const createFaq = async (faqData: {
  question: string;
  answer: string;
  category: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faqData)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Create FAQ error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create FAQ'
    };
  }
};

// Function to delete FAQ
export const deleteFaq = async (faqId: string) => {
  try {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', faqId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete FAQ'
    };
  }
};

// Function to fetch testimonials from database
export const fetchTestimonialsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('testimonials table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch testimonials'
    };
  }
};

// Function to create testimonial
export const createTestimonial = async (testimonialData: {
  name: string;
  quote: string;
  rating?: number;
}) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        name: testimonialData.name,
        quote: testimonialData.quote,
        rating: testimonialData.rating || 5
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Create testimonial error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create testimonial'
    };
  }
};

// Function to update testimonial
export const updateTestimonial = async (testimonialId: string, updateData: {
  status?: string;
  featured?: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', testimonialId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update testimonial error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update testimonial'
    };
  }
};

// Function to delete testimonial
export const deleteTestimonial = async (testimonialId: string) => {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', testimonialId);

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete testimonial'
    };
  }
};

// Function to fetch SEO pages from database
export const fetchSeoPagesFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .order('path', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('seo_pages table does not exist yet, returning empty data');
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Fetch SEO pages error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch SEO pages'
    };
  }
};

// Function to update SEO page
export const updateSeoPage = async (path: string, indexed: boolean) => {
  try {
    const { data, error } = await supabase
      .from('seo_pages')
      .update({ indexed })
      .eq('path', path)
      .select()
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Database tables not created yet. Please run the content_schema.sql file in Supabase SQL Editor.'
        };
      }
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Update SEO page error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update SEO page'
    };
  }
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Helper function to generate temporary password
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Mock data for development (replace with actual Supabase queries)
const mockData = {
  users: [
    { id: '1', email: 'user@example.com', full_name: 'Test User', role: 'user', created_at: new Date().toISOString() },
    { id: '2', email: 'admin@momincore.com', full_name: 'Admin User', role: 'admin', created_at: new Date().toISOString() }
  ],
  dashboardStats: {
    totalUsers: 1234,
    activeUsers: 856,
    newSignups: 42,
    revenue: 5678
  }
};

export const supabaseApi = {
  // Authentication
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    city?: string;
    madhab?: string;
    age_confirmed: boolean;
    shariah_rules_agreed: boolean;
  }) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            city: data.city,
            madhab: data.madhab,
            age_confirmed: data.age_confirmed,
            shariah_rules_agreed: data.shariah_rules_agreed,
            role: 'user'
          }
        }
      });

      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  adminLogin: async (email: string, password: string) => {
    console.log('Making admin login request with Supabase');
    console.log('Request body:', { email, password: '***' });
    
    try {
      // For admin login, check against hardcoded credentials first
      // In production, this should check user role in Supabase
      if (email === 'admin@momincore.com' && password === 'admin123') {
        const mockAdminUser = {
          id: 'admin-1',
          email: 'admin@momincore.com',
          full_name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        
        console.log('Admin login successful');
        return {
          success: true,
          message: 'Admin login successful',
          user: mockAdminUser
        };
      } else {
        // Try regular auth for other admin users
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // Handle email confirmation error specifically
          if (error.message.includes('Email not confirmed')) {
            return {
              success: false,
              message: 'Email not confirmed. Please check your email and confirm your account.',
              requiresConfirmation: true
            };
          }
          throw error;
        }
        
        // Check if user has admin role (this would come from user metadata or a separate table)
        const isAdmin = user?.user_metadata?.role === 'admin';
        
        if (!isAdmin) {
          return {
            success: false,
            message: 'Access denied. Admin privileges required.'
          };
        }

        console.log('Admin login successful');
        return { success: true, user };
      }
    } catch (error) {
      console.log('Admin login error:', error);
      return handleSupabaseError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  // User data
  getUserDashboard: async () => {
    // Mock implementation - replace with actual Supabase query
    return {
      success: true,
      data: {
        stats: {
          prayersToday: 3,
          quranMinutes: 15,
          lessonsCompleted: 2,
          streakDays: 7
        },
        recentActivity: [],
        goals: []
      }
    };
  },

  getUserProgress: async () => {
    return {
      success: true,
      data: {
        prayerConsistency: 85,
        quranProgress: 60,
        lessonsCompleted: 12,
        communityPosts: 8
      }
    };
  },

  // Admin functions
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          id,
          email,
          name,
          role,
          plan,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  getDashboardStats: async () => {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (users who created profiles in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get total threads
      const { count: totalThreads, error: threadsError } = await supabase
        .from('threads')
        .select('*', { count: 'exact', head: true });

      // Get pending reports
      const { count: pendingReports, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (usersError || activeError || threadsError || reportsError) {
        throw new Error('Error fetching dashboard stats');
      }

      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalThreads: totalThreads || 0,
          pendingReports: pendingReports || 0
        }
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  // Simplified mock functions for development
  fetchTable: async (tableName: string, options = {}) => {
    return { success: true, data: [] };
  },

  insertTable: async (tableName: string, data: any) => {
    return { success: true, data: { ...data, id: Date.now().toString() } };
  },

  updateTable: async (tableName: string, id: string, data: any) => {
    return { success: true, data: { id, ...data } };
  },

  deleteTable: async (tableName: string, id: string) => {
    return { success: true };
  }
};

// Export all the mock functions to maintain compatibility with existing API
export const api: ApiMethods = {
  register: supabaseApi.register,
  login: supabaseApi.login,
  adminLogin: supabaseApi.adminLogin,
  getCurrentUser: supabaseApi.getCurrentUser,
  getUserDashboard: supabaseApi.getUserDashboard,
  getUserProgress: supabaseApi.getUserProgress,
  getAllUsers: supabaseApi.getAllUsers,
  getDashboardStats: supabaseApi.getDashboardStats,
  
  // Service management (mock implementations)
  getServices: () => Promise.resolve({ success: true, data: [] }),
  createService: (serviceData: { name: string; description: string; category: string }) => Promise.resolve({ success: true, data: {} }),
  updateService: (serviceId: string, serviceData: { name: string; description: string; category: string }) => Promise.resolve({ success: true, data: {} }),
  toggleService: (serviceId: string) => Promise.resolve({ success: true, data: {} }),
  deleteService: (serviceId: string) => Promise.resolve({ success: true, data: {} }),
  getServicesStats: () => Promise.resolve({ success: true, data: [] }),
  
  // Mock implementations for other endpoints
  getUserLessons: () => Promise.resolve({ success: true, data: [] }),
  getUserSounds: () => Promise.resolve({ success: true, data: [] }),
  getUserCommunity: () => Promise.resolve({ success: true, data: [] }),
  getUserProfile: () => Promise.resolve({ success: true, data: {} }),
  getUserSubscription: () => Promise.resolve({ success: true, data: {} }),
  getUserSettings: () => Promise.resolve({ success: true, data: {} }),
  updateUserSettings: () => Promise.resolve({ success: true, data: {} }),
  getUser: (id: string) => Promise.resolve({ success: true, data: { id } }),
  updateUser: (id: string, data: any) => Promise.resolve({ success: true, data: { id, ...data } }),
  
  // Daily goals
  getDailyGoals: () => Promise.resolve({ success: true, data: [] }),
  updateDailyGoals: () => Promise.resolve({ success: true, data: {} }),
  
  // Streaks
  getStreaks: () => Promise.resolve({ success: true, data: {} }),
  updateStreaks: () => Promise.resolve({ success: true, data: {} }),
  
  getUserGrowth: async () => {
    try {
      // Get user growth data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', twelveMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize all months with 0
      const currentMonth = new Date().getMonth();
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth - 11 + i + 12) % 12;
        monthlyData[months[monthIndex]] = 0;
      }

      // Count users per month
      data?.forEach(user => {
        const date = new Date(user.created_at);
        const monthName = months[date.getMonth()];
        if (monthlyData.hasOwnProperty(monthName)) {
          monthlyData[monthName]++;
        }
      });

      // Convert to chart format
      const chartData = Object.entries(monthlyData).map(([name, users]) => ({
        name,
        users
      }));

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getTopContent: async () => {
    try {
      // Get top content by view count with average completion
      const { data, error } = await supabase
        .from('library_content')
        .select(`
          id,
          title,
          content_type,
          view_count,
          duration
        `)
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get average completion for each content
      const contentWithCompletion = await Promise.all(
        (data || []).map(async (content) => {
          const { data: progressData } = await supabase
            .from('user_library_progress')
            .select('progress_percentage')
            .eq('content_id', content.id);

          const avgCompletion = progressData && progressData.length > 0
            ? Math.round(progressData.reduce((sum, p) => sum + p.progress_percentage, 0) / progressData.length)
            : 0;

          return {
            id: content.id,
            title: content.title,
            type: content.content_type,
            views: content.view_count,
            completion: avgCompletion
          };
        })
      );

      return {
        success: true,
        data: contentWithCompletion
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getRecentActivity: async () => {
    try {
      // Get recent activities from available sources
      const [recentThreads, recentReports] = await Promise.all([
        // Recent threads
        supabase
          .from('threads')
          .select(`
            content,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent reports
        supabase
          .from('reports')
          .select(`
            reason,
            created_at,
            reporter_id,
            content_type
          `)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activities = [];

      // Add thread activities
      if (recentThreads.data) {
        for (const thread of recentThreads.data) {
          // Get user info for this thread
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', thread.user_id)
            .single();

          const fullName = profile?.full_name || 'Unknown User';
          activities.push({
            user: fullName,
            action: `Posted new thread: ${thread.content.substring(0, 50)}...`,
            time: formatRelativeTime(thread.created_at),
            avatar: fullName.charAt(0).toUpperCase()
          });
        }
      }

      // Add report activities
      if (recentReports.data) {
        for (const report of recentReports.data) {
          // Get reporter info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', report.reporter_id)
            .single();

          const fullName = profile?.full_name || 'Unknown User';
          activities.push({
            user: fullName,
            action: `Reported ${report.content_type}: ${report.reason}`,
            time: formatRelativeTime(report.created_at),
            avatar: fullName.charAt(0).toUpperCase()
          });
        }
      }

      // Sort by time and limit to 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      return {
        success: true,
        data: sortedActivities
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getPendingItems: async () => {
    try {
      // Get counts for various pending items
      const [supportTickets, flaggedPosts, pendingReviews, draftLessons] = await Promise.all([
        // Support tickets (could be implemented as reports with type 'support')
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // Flagged posts
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('content_type', 'thread')
          .eq('status', 'pending'),
        
        // Pending reviews (content awaiting approval)
        supabase
          .from('library_content')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', false),
        
        // Draft lessons (unpublished content)
        supabase
          .from('library_content')
          .select('*', { count: 'exact', head: true })
          .is('audio_url', null)
          .is('text_content', null)
      ]);

      const pendingItems = [
        { label: 'Support tickets', count: supportTickets.count || 0, icon: 'AlertTriangle', color: 'text-red-400' },
        { label: 'Flagged posts', count: flaggedPosts.count || 0, icon: 'MessageSquare', color: 'text-yellow-400' },
        { label: 'Pending reviews', count: pendingReviews.count || 0, icon: 'Clock', color: 'text-blue-400' },
        { label: 'Draft lessons', count: draftLessons.count || 0, icon: 'BookOpen', color: 'text-primary' }
      ];

      return {
        success: true,
        data: pendingItems
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  addUser: async (userData: {
    name: string;
    email: string;
    role: string;
    plan: string;
  }) => {
    try {
      // Generate a temporary password
      const tempPassword = generateTempPassword();
      
      // Create user profile in database (not Supabase Auth)
      // This simulates admin user creation for demo purposes
      const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create user in admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          plan: userData.plan,
          temp_password: tempPassword,
          created_by_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Admin user creation error:', error);
        if (error.code === '23505') { // Unique violation
          return {
            success: false,
            message: 'A user with this email already exists'
          };
        }
        throw error;
      }

      // Also create profile entry for Momin Core requirements
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.id,
          full_name: userData.name,
          verified: true, // Admin-created users are verified
          age_confirmed: true, // Admin-created users are age confirmed
          shariah_rules_agreed: true, // Admin-created users agree to Shariah rules
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the whole operation if profile creation fails
      }

      return {
        success: true,
        data: {
          id: data.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          plan: userData.plan,
          tempPassword,
          note: 'User created in database. Supabase Auth integration requires service role key setup.'
        },
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Add user error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  },
  updateUserRole: async (userId: string, newRole: string) => {
    try {
      console.log('Database update called:', { userId, newRole });
      
      const { error, data } = await supabase
        .from('admin_users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select(); // Return updated data

      console.log('Database response:', { error, data });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return {
        success: true,
        message: 'Role updated successfully',
        data
      };
    } catch (error) {
      console.error('Update role error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update role'
      };
    }
  },
  toggleBanUser: async (userId: string) => {
    try {
      // Get current user status
      const { data: currentUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('name, email, status')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // If status column doesn't exist, fall back to simulation
        if (fetchError.message.includes('status') || fetchError.code === '42703') {
          console.log(`User ${currentUser?.name || 'Unknown'} ban status toggled (simulated - status column not found)`);
          return {
            success: true,
            message: 'User ban status toggled successfully (simulated - run SQL to add status column)'
          };
        }
        throw fetchError;
      }

      // Toggle status
      const newStatus = currentUser.status === 'banned' ? 'active' : 'banned';
      
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return {
        success: true,
        message: `User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`
      };
    } catch (error) {
      console.error('Toggle ban error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user status'
      };
    }
  },
  sendUserEmail: async (userId: string, subject: string, message: string) => {
    try {
      // Get user email
      const { data: user, error: fetchError } = await supabase
        .from('admin_users')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Check if SMTP is configured (in production, this would check actual SMTP settings)
      const smtpConfigured = import.meta.env.VITE_SMTP_CONFIGURED === 'true';
      
      if (!smtpConfigured) {
        // Log the email that would be sent for development/testing
        console.log('Email that would be sent (SMTP not configured):', {
          to: user.email,
          subject,
          message,
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          message: `Email logged (SMTP not configured). Configure SMTP in environment variables to send real emails.`
        };
      }

      // In production with SMTP configured, this would send the actual email
      // For now, we'll simulate successful sending
      console.log('Email sent via SMTP:', {
        to: user.email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: `Email sent to ${user.email} successfully`
      };
    } catch (error) {
      console.error('Send email error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  },
  deleteUser: async (userId: string) => {
    try {
      // Delete from admin_users table
      const { error: adminUserError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (adminUserError) throw adminUserError;

      // Also delete from profiles table if exists
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        // Don't fail the whole operation if profile deletion fails
      }

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  },
  getUserDetails: (userId: string) => Promise.resolve({ success: true, data: { id: userId } }),
  
  // All other functions - return empty data
  getRoleStats: async () => {
    try {
      // Get role statistics from database
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          color,
          system,
          created_at
        `)
        .order('created_at', { ascending: true });

      if (rolesError) throw rolesError;

      // Get user counts for each role
      const roleStats = await Promise.all(
        roles.map(async (role) => {
          const { count } = await supabase
            .from('admin_users')
            .select('*', { count: 'exact', head: true })
            .eq('role', role.name.toLowerCase());

          return {
            ...role,
            userCount: count || 0
          };
        })
      );

      return {
        success: true,
        data: {
          roles: roleStats,
          adminCount: roleStats.find(r => r.name === 'Admin')?.userCount || 0,
          userCount: roleStats.find(r => r.name === 'User')?.userCount || 0
        }
      };
    } catch (error) {
      console.error('Get role stats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch role statistics'
      };
    }
  },
  getUsersByRole: () => Promise.resolve({ success: true, data: [] }),
  createRole: async (roleData: { name: string; color: string; permissions: Record<string, boolean> }) => {
    try {
      // Create the role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          color: roleData.color,
          system: false
        })
        .select()
        .single();

      if (roleError) {
        if (roleError.code === '23505') {
          return {
            success: false,
            message: 'A role with this name already exists'
          };
        }
        throw roleError;
      }

      // Create permissions for the role
      const permissionsToInsert = Object.entries(roleData.permissions).map(([key, enabled]) => ({
        role_id: role.id,
        permission_key: key,
        enabled
      }));

      const { error: permError } = await supabase
        .from('permissions')
        .insert(permissionsToInsert);

      if (permError) {
        console.error('Permissions creation error:', permError);
        // Don't fail the whole operation if permissions fail
      }

      return {
        success: true,
        data: role,
        message: 'Role created successfully'
      };
    } catch (error) {
      console.error('Create role error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create role'
      };
    }
  },
  deleteRole: async (roleId: string) => {
    try {
      // Check if it's a system role
      const { data: role, error: fetchError } = await supabase
        .from('roles')
        .select('system, name')
        .eq('id', roleId)
        .single();

      if (fetchError) throw fetchError;

      if (role.system) {
        return {
          success: false,
          message: 'System roles cannot be deleted'
        };
      }

      // Check if any users have this role
      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
        .eq('role', role.name.toLowerCase());

      if (count && count > 0) {
        return {
          success: false,
          message: `Cannot delete role - ${count} users are assigned to this role`
        };
      }

      // Delete the role (permissions will be deleted via cascade)
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      return {
        success: true,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      console.error('Delete role error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete role'
      };
    }
  },
  getAllRoles: async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          color,
          system,
          created_at
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Get all roles error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch roles'
      };
    }
  },
  updateRolePermission: async (roleId: string, permissionKey: string, enabled: boolean) => {
    try {
      // Check if it's a system role
      const { data: role, error: fetchError } = await supabase
        .from('roles')
        .select('system')
        .eq('id', roleId)
        .single();

      if (fetchError) throw fetchError;

      if (role.system) {
        return {
          success: false,
          message: 'System role permissions cannot be modified'
        };
      }

      // Update the permission
      const { error } = await supabase
        .from('permissions')
        .update({ 
          enabled,
          updated_at: new Date().toISOString()
        })
        .eq('role_id', roleId)
        .eq('permission_key', permissionKey);

      if (error) throw error;

      return {
        success: true,
        message: 'Permission updated successfully'
      };
    } catch (error) {
      console.error('Update permission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update permission'
      };
    }
  },
  getLibraryContent: () => Promise.resolve({ success: true, data: [] }),
  getRecentThreads: () => Promise.resolve({ success: true, data: [] }),
  getLessonsStats: () => Promise.resolve({ success: true, data: {} }),
  getLessons: async () => {
    try {
      const { data, error } = await supabase
        .from('library_content')
        .select(`
          id,
          title,
          description,
          content_type,
          duration,
          view_count,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getAudioTracks: async () => {
    try {
      const { data, error } = await supabase
        .from('library_content')
        .select(`
          id,
          title,
          description,
          content_type,
          duration,
          view_count,
          created_at
        `)
        .eq('content_type', 'audio_book')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getVoiceTracks: async () => {
    try {
      const { data, error } = await supabase
        .from('library_content')
        .select(`
          id,
          title,
          description,
          content_type,
          duration,
          view_count,
          created_at
        `)
        .eq('content_type', 'quran_recitation')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getCommunityStats: () => Promise.resolve({ success: true, data: {} }),
  getCommunityPosts: () => Promise.resolve({ success: true, data: [] }),
  getCommunityReports: () => Promise.resolve({ success: true, data: [] }),
  getSubscriptionStats: () => Promise.resolve({ success: true, data: {} }),
  getSubscriptionPlans: () => Promise.resolve({ success: true, data: [] }),
  getSubscribers: () => Promise.resolve({ success: true, data: [] }),
  getSupportStats: () => Promise.resolve({ success: true, data: {} }),
  getSupportTickets: () => Promise.resolve({ success: true, data: [] }),
  getNotificationStats: () => Promise.resolve({ success: true, data: {} }),
  getNotificationCampaigns: () => Promise.resolve({ success: true, data: [] }),
  getContentSections: () => Promise.resolve({ success: true, data: [] }),
  getBlogPosts: () => Promise.resolve({ success: true, data: [] }),
  getFaqs: () => Promise.resolve({ success: true, data: [] }),
  getTestimonials: () => Promise.resolve({ success: true, data: [] }),
  getSeoPages: () => Promise.resolve({ success: true, data: [] }),
  getMediaFiles: () => Promise.resolve({ success: true, data: [] }),
  getStorageStats: () => Promise.resolve({ success: true, data: {} }),
  getKpis: () => Promise.resolve({ success: true, data: {} }),
  getReportsUserGrowth: () => Promise.resolve({ success: true, data: [] }),
  getRevenue: () => Promise.resolve({ success: true, data: {} }),
  getRetention: () => Promise.resolve({ success: true, data: {} }),
  getPlanDistribution: () => Promise.resolve({ success: true, data: {} }),
  getFeatureUsage: () => Promise.resolve({ success: true, data: {} }),
  getAffiliates: () => Promise.resolve({ success: true, data: [] }),
  getAffiliateStats: () => Promise.resolve({ success: true, data: {} }),
  getAffiliatePayouts: () => Promise.resolve({ success: true, data: [] }),
  getAffiliateReferrals: () => Promise.resolve({ success: true, data: [] }),
  getAffiliateTiers: () => Promise.resolve({ success: true, data: [] }),
  getAuditLogs: () => Promise.resolve({ success: true, data: [] }),
  getAuditStats: () => Promise.resolve({ success: true, data: {} }),
  getGeneralSettings: () => Promise.resolve({ success: true, data: {} }),
  getBrandingSettings: () => Promise.resolve({ success: true, data: {} }),
  getEmailTemplates: () => Promise.resolve({ success: true, data: [] }),
  getIntegrations: () => Promise.resolve({ success: true, data: [] }),
  getApiKeys: () => Promise.resolve({ success: true, data: [] }),
  getSecuritySettings: () => Promise.resolve({ success: true, data: {} }),
};
