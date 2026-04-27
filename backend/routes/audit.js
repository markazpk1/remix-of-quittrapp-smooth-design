const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// Get audit logs
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0, severity, category, search } = req.query;
    
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        details,
        ip_address,
        created_at,
        user_id,
        profiles!audit_logs_user_id_fkey (
          full_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (search) {
      query = query.or(`action.ilike.%${search}%,details.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Get audit logs error:', error);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }

    // Transform data to match frontend interface
    const transformedLogs = (data || []).map(log => {
      // Extract category and severity from details or action
      const details = log.details || {};
      const category = details.category || inferCategoryFromAction(log.action);
      const severity = details.severity || inferSeverityFromAction(log.action);
      
      return {
        id: log.id,
        action: log.action,
        actor: log.profiles?.full_name || 'Unknown User',
        target: details.target || log.action,
        category,
        severity,
        ip: log.ip_address || '—',
        timestamp: new Date(log.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(',', '')
      };
    });

    // Apply client-side filtering for severity and category
    let filteredLogs = transformedLogs;
    if (severity && severity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    if (category && category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    res.json({
      logs: filteredLogs,
      total: count || 0,
      filtered: filteredLogs.length
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit log statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, details, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Get audit stats error:', error);
      return res.status(500).json({ error: 'Failed to fetch audit statistics' });
    }

    const logs = data || [];
    
    // Calculate statistics
    const stats = {
      total: logs.length,
      bySeverity: {
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      byCategory: {},
      recentActivity: logs.slice(0, 10).map(log => ({
        action: log.action,
        timestamp: new Date(log.created_at).toLocaleString()
      }))
    };

    logs.forEach(log => {
      const details = log.details || {};
      const severity = details.severity || inferSeverityFromAction(log.action);
      const category = details.category || inferCategoryFromAction(log.action);

      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create audit log entry (placeholder - would be called by other admin actions)
router.post('/logs', async (req, res) => {
  try {
    const { action, details, ipAddress } = req.body;
    
    // This would typically be called internally by other admin endpoints
    // For now, return 501 as this is a placeholder
    res.status(501).json({ error: 'Audit log creation not implemented yet' });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function inferCategoryFromAction(action) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('login') || actionLower.includes('auth')) return 'auth';
  if (actionLower.includes('ban') || actionLower.includes('suspend') || actionLower.includes('delete')) return 'moderation';
  if (actionLower.includes('role') || actionLower.includes('permission')) return 'permissions';
  if (actionLower.includes('content') || actionLower.includes('post') || actionLower.includes('lesson')) return 'content';
  if (actionLower.includes('setting') || actionLower.includes('toggle') || actionLower.includes('maintenance')) return 'settings';
  if (actionLower.includes('subscription') || actionLower.includes('billing') || actionLower.includes('payment')) return 'billing';
  if (actionLower.includes('notification') || actionLower.includes('email')) return 'notifications';
  if (actionLower.includes('security') || actionLower.includes('api') || actionLower.includes('key')) return 'security';
  if (actionLower.includes('export') || actionLower.includes('data')) return 'data';
  return 'other';
}

function inferSeverityFromAction(action) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('ban') || actionLower.includes('delete') || actionLower.includes('security') || actionLower.includes('api')) return 'high';
  if (actionLower.includes('role') || actionLower.includes('permission') || actionLower.includes('subscription') || actionLower.includes('billing')) return 'medium';
  if (actionLower.includes('login') || actionLower.includes('auth')) return 'info';
  return 'low';
}

module.exports = router;
