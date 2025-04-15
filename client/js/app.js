document.addEventListener('DOMContentLoaded', function() {
  // DOM elements for tabs
  const mappingsTab = document.getElementById('mappings-tab');
  const logsTab = document.getElementById('logs-tab');
  const settingsTab = document.getElementById('settings-tab');
  
  // DOM elements for sections
  const mappingsSection = document.getElementById('mappings-section');
  const logsSection = document.getElementById('logs-section');
  const settingsSection = document.getElementById('settings-section');
  
  // DOM elements for forms
  const addMappingForm = document.getElementById('add-mapping-form');
  const bulkImportForm = document.getElementById('bulk-import-form');
  const editMappingForm = document.getElementById('edit-mapping-form');

  // DOM elements for buttons
  const refreshMappingsBtn = document.getElementById('refresh-mappings');
  const refreshLogsBtn = document.getElementById('refresh-logs');
  const registerWebhookBtn = document.getElementById('register-webhook-btn');
  const saveEditMappingBtn = document.getElementById('save-edit-mapping');
  
  // Modal references
  const editMappingModal = new bootstrap.Modal(document.getElementById('editMappingModal'));
  const logDetailsModal = new bootstrap.Modal(document.getElementById('logDetailsModal'));
  
  // Tab Navigation
  mappingsTab.addEventListener('click', function(e) {
    e.preventDefault();
    setActiveTab(mappingsTab);
    showSection(mappingsSection);
  });
  
  logsTab.addEventListener('click', function(e) {
    e.preventDefault();
    setActiveTab(logsTab);
    showSection(logsSection);
    loadLogs();
  });
  
  settingsTab.addEventListener('click', function(e) {
    e.preventDefault();
    setActiveTab(settingsTab);
    showSection(settingsSection);
  });
  
  // Set active tab
  function setActiveTab(activeTab) {
    [mappingsTab, logsTab, settingsTab].forEach(tab => {
      tab.classList.remove('active');
    });
    activeTab.classList.add('active');
  }
  
  // Show section
  function showSection(activeSection) {
    [mappingsSection, logsSection, settingsSection].forEach(section => {
      section.style.display = 'none';
    });
    activeSection.style.display = 'block';
  }
  
  // API functions
  async function fetchMappings() {
    try {
      const response = await fetch('/api/sku-mappings');
      if (!response.ok) {
        throw new Error('Failed to fetch SKU mappings');
      }
      const mappings = await response.json();
      return mappings;
    } catch (error) {
      console.error('Error fetching mappings:', error);
      showAlert('error', 'Failed to load SKU mappings: ' + error.message);
      return [];
    }
  }
  
  async function createMapping(mappingData) {
    try {
      const response = await fetch('/api/sku-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mapping');
      }
      
      const newMapping = await response.json();
      showAlert('success', 'SKU mapping created successfully');
      return newMapping;
    } catch (error) {
      console.error('Error creating mapping:', error);
      showAlert('error', error.message);
      return null;
    }
  }
  
  async function updateMapping(id, mappingData) {
    try {
      const response = await fetch(`/api/sku-mappings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update mapping');
      }
      
      const updatedMapping = await response.json();
      showAlert('success', 'SKU mapping updated successfully');
      return updatedMapping;
    } catch (error) {
      console.error('Error updating mapping:', error);
      showAlert('error', error.message);
      return null;
    }
  }
  
  async function deleteMapping(id) {
    try {
      const response = await fetch(`/api/sku-mappings/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete mapping');
      }
      
      showAlert('success', 'SKU mapping deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting mapping:', error);
      showAlert('error', error.message);
      return false;
    }
  }
  
  async function bulkImportMappings(mappings) {
    try {
      const response = await fetch('/api/sku-mappings/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mappings })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import mappings');
      }
      
      const result = await response.json();
      if (result.failed > 0) {
        showAlert('warning', `Imported ${result.success} mappings, ${result.failed} failed`);
      } else {
        showAlert('success', `Successfully imported ${result.success} mappings`);
      }
      return result;
    } catch (error) {
      console.error('Error importing mappings:', error);
      showAlert('error', error.message);
      return null;
    }
  }
  
  async function fetchLogs() {
    try {
      const response = await fetch('/api/webhooks/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch processing logs');
      }
      const logs = await response.json();
      return logs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      showAlert('error', 'Failed to load processing logs: ' + error.message);
      return [];
    }
  }
  
  async function registerWebhook() {
    try {
      const response = await fetch('/api/webhooks/register', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        showAlert('success', 'Webhook registered successfully');
      } else {
        throw new Error(result.error || 'Failed to register webhook');
      }
      
      return result;
    } catch (error) {
      console.error('Error registering webhook:', error);
      showAlert('error', error.message);
      return null;
    }
  }
  
  // UI functions
  function displayMappings(mappings) {
    const tbody = document.getElementById('mappings-tbody');
    const noMappingsMessage = document.getElementById('no-mappings-message');
    
    tbody.innerHTML = '';
    
    if (mappings.length === 0) {
      noMappingsMessage.style.display = 'block';
      return;
    }
    
    noMappingsMessage.style.display = 'none';
    
    mappings.forEach(mapping => {
      const tr = document.createElement('tr');
      
      const originalSkuTd = document.createElement('td');
      originalSkuTd.innerHTML = `<span class="badge bg-secondary sku-badge">${mapping.originalSku}</span>`;
      
      const replacementSkuTd = document.createElement('td');
      replacementSkuTd.innerHTML = `<span class="badge bg-primary sku-badge">${mapping.replacementSku}</span>`;
      
      const statusTd = document.createElement('td');
      if (mapping.active) {
        statusTd.innerHTML = '<span class="badge bg-success">Active</span>';
      } else {
        statusTd.innerHTML = '<span class="badge bg-danger">Inactive</span>';
      }
      
      const updatedAtTd = document.createElement('td');
      updatedAtTd.textContent = new Date(mapping.updatedAt).toLocaleString();
      
      const actionsTd = document.createElement('td');
      actionsTd.innerHTML = `
        <button class="btn btn-sm btn-outline-primary edit-mapping-btn" data-id="${mapping._id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-mapping-btn ms-2" data-id="${mapping._id}">
          <i class="bi bi-trash"></i>
        </button>
      `;
      
      tr.appendChild(originalSkuTd);
      tr.appendChild(replacementSkuTd);
      tr.appendChild(statusTd);
      tr.appendChild(updatedAtTd);
      tr.appendChild(actionsTd);
      
      tbody.appendChild(tr);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-mapping-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const mapping = mappings.find(m => m._id === id);
        if (mapping) {
          document.getElementById('edit-mapping-id').value = mapping._id;
          document.getElementById('edit-original-sku').value = mapping.originalSku;
          document.getElementById('edit-replacement-sku').value = mapping.replacementSku;
          document.getElementById('edit-active').checked = mapping.active;
          editMappingModal.show();
        }
      });
    });
    
    document.querySelectorAll('.delete-mapping-btn').forEach(button => {
      button.addEventListener('click', async function() {
        if (confirm('Are you sure you want to delete this SKU mapping?')) {
          const id = this.getAttribute('data-id');
          const success = await deleteMapping(id);
          if (success) {
            loadMappings();
          }
        }
      });
    });
  }
  
  function displayLogs(logs) {
    const tbody = document.getElementById('logs-tbody');
    const noLogsMessage = document.getElementById('no-logs-message');
    
    tbody.innerHTML = '';
    
    if (logs.length === 0) {
      noLogsMessage.style.display = 'block';
      return;
    }
    
    noLogsMessage.style.display = 'none';
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      
      const orderTd = document.createElement('td');
      orderTd.textContent = log.orderName || log.orderId;
      
      const statusTd = document.createElement('td');
      if (log.status === 'success') {
        statusTd.innerHTML = '<span class="badge bg-success">Success</span>';
      } else {
        statusTd.innerHTML = '<span class="badge bg-danger">Error</span>';
      }
      
      const messageTd = document.createElement('td');
      messageTd.textContent = log.message;
      
      const replacementsTd = document.createElement('td');
      if (log.replacements && log.replacements.length > 0) {
        replacementsTd.textContent = log.replacements.length;
      } else {
        replacementsTd.textContent = '0';
      }
      
      const processedAtTd = document.createElement('td');
      processedAtTd.textContent = new Date(log.processedAt).toLocaleString();
      
      const detailsTd = document.createElement('td');
      detailsTd.innerHTML = `
        <button class="btn btn-sm btn-outline-info view-log-details-btn" data-log-id="${log._id}">
          <i class="bi bi-info-circle"></i> Details
        </button>
      `;
      
      tr.appendChild(orderTd);
      tr.appendChild(statusTd);
      tr.appendChild(messageTd);
      tr.appendChild(replacementsTd);
      tr.appendChild(processedAtTd);
      tr.appendChild(detailsTd);
      
      tbody.appendChild(tr);
    });
    
    // Add event listeners for detail buttons
    document.querySelectorAll('.view-log-details-btn').forEach(button => {
      button.addEventListener('click', function() {
        const logId = this.getAttribute('data-log-id');
        const log = logs.find(l => l._id === logId);
        
        if (log) {
          displayLogDetails(log);
          logDetailsModal.show();
        }
      });
    });
  }
  
  function displayLogDetails(log) {
    const detailsContent = document.getElementById('log-details-content');
    
    let replacementsHtml = '';
    if (log.replacements && log.replacements.length > 0) {
      replacementsHtml = `
        <h6>SKU Replacements:</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Original SKU</th>
                <th>Replacement SKU</th>
                <th>Line Item ID</th>
              </tr>
            </thead>
            <tbody>
              ${log.replacements.map(r => `
                <tr>
                  <td><span class="badge bg-secondary sku-badge">${r.originalSku}</span></td>
                  <td><span class="badge bg-primary sku-badge">${r.replacementSku}</span></td>
                  <td>${r.lineItemId}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      replacementsHtml = '<p>No SKU replacements were made for this order.</p>';
    }
    
    let errorDetailsHtml = '';
    if (log.status === 'error' && log.errorDetails) {
      errorDetailsHtml = `
        <h6>Error Details:</h6>
        <div class="alert alert-danger">
          ${typeof log.errorDetails === 'object'
            ? JSON.stringify(log.errorDetails, null, 2)
            : log.errorDetails}
        </div>
      `;
    }
    
    detailsContent.innerHTML = `
      <div class="mb-3">
        <h6>Order Information:</h6>
        <p><strong>Order ID:</strong> ${log.orderId}</p>
        <p><strong>Order Name:</strong> ${log.orderName || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="badge bg-${log.status === 'success' ? 'success' : 'danger'}">${log.status}</span></p>
        <p><strong>Processed At:</strong> ${new Date(log.processedAt).toLocaleString()}</p>
        <p><strong>Message:</strong> ${log.message}</p>
      </div>
      
      ${replacementsHtml}
      ${errorDetailsHtml}
    `;
  }
  
  function showAlert(type, message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to beginning of app container
    const appContainer = document.getElementById('app');
    appContainer.insertBefore(alertDiv, appContainer.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      alertDiv.classList.remove('show');
      setTimeout(() => {
        alertDiv.remove();
      }, 150);
    }, 5000);
  }
  
  // Load data
  async function loadMappings() {
    const mappings = await fetchMappings();
    displayMappings(mappings);
  }
  
  async function loadLogs() {
    const logs = await fetchLogs();
    displayLogs(logs);
  }
  
  // Event listeners
  addMappingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const originalSku = document.getElementById('originalSku').value.trim();
    const replacementSku = document.getElementById('replacementSku').value.trim();
    
    const newMapping = await createMapping({
      originalSku,
      replacementSku
    });
    
    if (newMapping) {
      addMappingForm.reset();
      loadMappings();
    }
  });
  
  bulkImportForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const bulkMappingsText = document.getElementById('bulkMappings').value.trim();
    if (!bulkMappingsText) {
      showAlert('warning', 'Please enter mappings to import');
      return;
    }
    
    const lines = bulkMappingsText.split('\n');
    const mappings = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const parts = trimmedLine.split(',');
      if (parts.length !== 2) {
        showAlert('warning', `Invalid mapping format: ${trimmedLine}`);
        continue;
      }
      
      const originalSku = parts[0].trim();
      const replacementSku = parts[1].trim();
      
      if (!originalSku || !replacementSku) {
        showAlert('warning', `Invalid mapping values: ${trimmedLine}`);
        continue;
      }
      
      mappings.push({
        originalSku,
        replacementSku
      });
    }
    
    if (mappings.length === 0) {
      showAlert('warning', 'No valid mappings found');
      return;
    }
    
    const result = await bulkImportMappings(mappings);
    if (result) {
      bulkImportForm.reset();
      loadMappings();
    }
  });
  
  saveEditMappingBtn.addEventListener('click', async function() {
    const id = document.getElementById('edit-mapping-id').value;
    const originalSku = document.getElementById('edit-original-sku').value.trim();
    const replacementSku = document.getElementById('edit-replacement-sku').value.trim();
    const active = document.getElementById('edit-active').checked;
    
    const updatedMapping = await updateMapping(id, {
      originalSku,
      replacementSku,
      active
    });
    
    if (updatedMapping) {
      editMappingModal.hide();
      loadMappings();
    }
  });
  
  refreshMappingsBtn.addEventListener('click', loadMappings);
  refreshLogsBtn.addEventListener('click', loadLogs);
  
  registerWebhookBtn.addEventListener('click', async function() {
    this.disabled = true;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
    
    const result = await registerWebhook();
    
    this.disabled = false;
    this.innerHTML = 'Register Webhook';
    
    if (result && result.success) {
      document.getElementById('webhook-result').innerHTML = '<div class="alert alert-success">Webhook registered successfully!</div>';
    } else {
      document.getElementById('webhook-result').innerHTML = `<div class="alert alert-danger">Failed to register webhook: ${result ? result.error : 'Unknown error'}</div>`;
    }
  });
  
  // Initialize
  loadMappings();
});
