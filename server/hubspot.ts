// HubSpot Integration - Connected via Replit Connector
import { Client } from '@hubspot/api-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=hubspot',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('HubSpot not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

// Fetch pipeline stages to map IDs to labels
export async function getPipelineStages() {
  const client = await getUncachableHubSpotClient();
  
  try {
    const pipelines = await client.crm.pipelines.pipelinesApi.getAll('deals');
    const stageMap: Record<string, { label: string; pipelineName: string }> = {};
    
    for (const pipeline of pipelines.results) {
      for (const stage of pipeline.stages) {
        stageMap[stage.id] = {
          label: stage.label,
          pipelineName: pipeline.label
        };
      }
    }
    
    console.log('HubSpot pipeline stages:', stageMap);
    return stageMap;
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    return {};
  }
}

// Fetch all deals from HubSpot
export async function getDeals() {
  const client = await getUncachableHubSpotClient();
  const stageMap = await getPipelineStages();
  
  try {
    const response = await client.crm.deals.basicApi.getPage(
      100, // limit
      undefined, // after
      ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline', 'createdate']
    );
    
    return response.results.map(deal => {
      const stageId = deal.properties.dealstage || 'unknown';
      const stageInfo = stageMap[stageId];
      
      return {
        id: deal.id,
        name: deal.properties.dealname || 'Unnamed Deal',
        amount: parseFloat(deal.properties.amount || '0'),
        stage: stageId,
        stageLabel: stageInfo?.label || stageId,
        closeDate: deal.properties.closedate || null,
        createdAt: deal.properties.createdate || null,
        pipeline: deal.properties.pipeline || 'default',
      };
    });
  } catch (error) {
    console.error('Error fetching HubSpot deals:', error);
    throw error;
  }
}

// Get deals summary for dashboard metrics
export async function getDealsSummary() {
  const deals = await getDeals();
  
  // Filter for closed/won deals - check stage label for "won"
  const closedWonDeals = deals.filter(deal => 
    deal.stageLabel.toLowerCase().includes('won')
  );
  
  const closedWonRevenue = closedWonDeals.reduce((sum, deal) => sum + deal.amount, 0);
  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const totalDeals = deals.length;
  const closedWonCount = closedWonDeals.length;
  
  // Group deals by stage label (human-readable)
  const stageGroups = deals.reduce((acc, deal) => {
    const label = deal.stageLabel;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Revenue by stage for debugging
  const revenueByStage = deals.reduce((acc, deal) => {
    const label = deal.stageLabel;
    acc[label] = (acc[label] || 0) + deal.amount;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('HubSpot deals breakdown:', {
    totalDeals,
    closedWonCount,
    closedWonRevenue,
    totalPipelineValue,
    stageGroups,
    revenueByStage
  });
  
  return {
    totalRevenue: closedWonRevenue, // Only closed/won revenue
    totalPipelineValue, // All deals value for reference
    totalDeals,
    closedWonCount,
    stageGroups,
    revenueByStage,
    deals,
  };
}
