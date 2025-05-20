// Global variables
let inventory = [];
let currentPage = 1;
const itemsPerPage = 5;
let currentFilter = 'all';
let searchTerm = '';
let selectedItemId = null;

// DOM elements
const inventoryBody = document.getElementById('inventory-body');
const addItemBtn = document.getElementById('add-item-btn');
const addItemModal = document.getElementById('add-item-modal');
const editItemModal = document.getElementById('edit-item-modal');
const deleteModal = document.getElementById('delete-modal');
const addItemForm = document.getElementById('add-item-form');
const editItemForm = document.getElementById('edit-item-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const pagination = document.getElementById('pagination');
const filterBtns = document.querySelectorAll('.filter-btn');

// Sample data
const sampleInventory = [
    { id: 1, name: "Laptop", category: "Electronics", quantity: 15, price: 899.99, description: "High-performance laptop with 16GB RAM", reorderLevel: 5 },
    { id: 2, name: "T-Shirt", category: "Clothing", quantity: 50, price: 19.99, description: "Cotton t-shirt, various colors", reorderLevel: 10 },
    { id: 3, name: "Desk Chair", category: "Office", quantity: 8, price: 149.99, description: "Ergonomic office chair", reorderLevel: 3 },
    { id: 4, name: "Coffee Beans", category: "Food", quantity: 25, price: 12.99, description: "Premium Arabica coffee beans, 1lb bag", reorderLevel: 8 },
    { id: 5, name: "Headphones", category: "Electronics", quantity: 20, price: 79.99, description: "Wireless over-ear headphones", reorderLevel: 5 },
    { id: 6, name: "Notebook", category: "Office", quantity: 100, price: 4.99, description: "Spiral notebook, 100 pages", reorderLevel: 20 },
    { id: 7, name: "Jeans", category: "Clothing", quantity: 30, price: 49.99, description: "Denim jeans, various sizes", reorderLevel: 7 },
    { id: 8, name: "Chocolate Bars", category: "Food", quantity: 40, price: 3.99, description: "Premium dark chocolate bars", reorderLevel: 15 },
    { id: 9, name: "Monitor", category: "Electronics", quantity: 12, price: 249.99, description: "27-inch LED monitor", reorderLevel: 4 },
    { id: 10, name: "Stapler", category: "Office", quantity: 25, price: 8.99, description: "Standard desktop stapler", reorderLevel: 5 }
];

// Initialize the application
function init() {
    // Load inventory from localStorage or use sample data if none exists
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    } else {
        inventory = sampleInventory;
        saveInventory();
    }

    // Display current date
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Initialize UI
    renderInventory();
    renderStats();
    renderCharts();

    // Set up event listeners
    setupEventListeners();
}

// Render inventory table based on current filter, search, and page
function renderInventory() {
    // Clear existing table rows
    inventoryBody.innerHTML = '';

    // Apply filters and search
    let filteredInventory = inventory.filter(item => {
        const matchesFilter = currentFilter === 'all' || item.category === currentFilter;
        const matchesSearch = searchTerm === '' ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

    // Render table rows
    paginatedInventory.forEach(item => {
        const row = document.createElement('tr');
        const itemValue = (item.quantity * item.price).toFixed(2);

        const isLowStock = item.quantity <= item.reorderLevel;
        const quantityClass = isLowStock ? 'low-stock' : '';

        row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td class="${quantityClass}">${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${itemValue}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-primary edit-btn" data-id="${item.id}">Edit</button>
                            <button class="btn btn-danger delete-btn" data-id="${item.id}">Delete</button>
                        </div>
                    </td>
                `;
        inventoryBody.appendChild(row);
    });

    // Render pagination controls
    renderPagination(totalPages);

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            openEditModal(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            openDeleteModal(id);
        });
    });
}

// Render pagination controls
function renderPagination(totalPages) {
    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&laquo;';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderInventory();
        }
    });
    pagination.appendChild(prevBtn);

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.toggle('active', i === currentPage);
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderInventory();
        });
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&raquo;';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderInventory();
        }
    });
    pagination.appendChild(nextBtn);
}

// Update statistics
function renderStats() {
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2);

    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('low-stock').textContent = lowStockItems;
    document.getElementById('total-value').textContent = `$${totalValue}`;
}

// Render charts
function renderCharts() {
    // Bar chart for top items by value
    const barChart = document.getElementById('bar-chart');
    barChart.innerHTML = '';

    // Calculate item values and sort
    const itemValues = inventory.map(item => ({
        name: item.name,
        value: item.quantity * item.price
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // Find maximum value for scaling
    const maxValue = Math.max(...itemValues.map(item => item.value));

    // Create bars
    itemValues.forEach(item => {
        const barWidth = (item.value / maxValue * 100);
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = `${barWidth}%`;
        bar.textContent = `${item.name}: $${item.value.toFixed(2)}`;
        barChart.appendChild(bar);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Add item button
    addItemBtn.addEventListener('click', () => {
        addItemModal.style.display = 'flex';
    });

    // Close modals when clicking X
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Cancel buttons for modals
    document.getElementById('cancel-add').addEventListener('click', () => {
        addItemModal.style.display = 'none';
        addItemForm.reset();
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
        editItemModal.style.display = 'none';
    });

    document.getElementById('cancel-delete').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    // Form submissions
    addItemForm.addEventListener('submit', handleAddItem);
    editItemForm.addEventListener('submit', handleEditItem);

    // Confirm delete button
    document.getElementById('confirm-delete').addEventListener('click', handleDeleteItem);

    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Category filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-category');
            currentPage = 1;
            renderInventory();
        });
    });
}

// Handle add item form submission
function handleAddItem(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const quantity = parseInt(document.getElementById('item-quantity').value);
    const price = parseFloat(document.getElementById('item-price').value);
    const description = document.getElementById('item-description').value;
    const reorderLevel = parseInt(document.getElementById('reorder-level').value);

    // Generate a new ID
    const newId = inventory.length > 0 ? Math.max(...inventory.map(item => item.id)) + 1 : 1;

    // Create new item object
    const newItem = {
        id: newId,
        name,
        category,
        quantity,
        price,
        description,
        reorderLevel
    };

    // Add to inventory
    inventory.push(newItem);
    saveInventory();

    // Close modal and reset form
    addItemModal.style.display = 'none';
    addItemForm.reset();

    // Refresh UI
    renderInventory();
    renderStats();
    renderCharts();

    // Show notification (could be enhanced with a proper notification system)
    alert(`Item "${name}" added successfully!`);
}

// Handle edit item form submission
function handleEditItem(e) {
    e.preventDefault();

    // Get form values
    const id = parseInt(document.getElementById('edit-item-id').value);
    const name = document.getElementById('edit-item-name').value;
    const category = document.getElementById('edit-item-category').value;
    const quantity = parseInt(document.getElementById('edit-item-quantity').value);
    const price = parseFloat(document.getElementById('edit-item-price').value);
    const description = document.getElementById('edit-item-description').value;
    const reorderLevel = parseInt(document.getElementById('edit-reorder-level').value);

    // Find item index
    const itemIndex = inventory.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        // Update item
        inventory[itemIndex] = {
            id,
            name,
            category,
            quantity,
            price,
            description,
            reorderLevel
        };

        saveInventory();

        // Close modal
        editItemModal.style.display = 'none';

        // Refresh UI
        renderInventory();
        renderStats();
        renderCharts();

        // Show notification
        alert(`Item "${name}" updated successfully!`);
    }
}

// Handle delete item
function handleDeleteItem() {
    if (selectedItemId !== null) {
        // Find item index
        const itemIndex = inventory.findIndex(item => item.id === selectedItemId);
        if (itemIndex !== -1) {
            const itemName = inventory[itemIndex].name;

            // Remove item
            inventory.splice(itemIndex, 1);
            saveInventory();

            // Close modal
            deleteModal.style.display = 'none';
            selectedItemId = null;

            // Refresh UI
            renderInventory();
            renderStats();
            renderCharts();

            // Show notification
            alert(`Item "${itemName}" deleted successfully!`);
        }
    }
}

// Open edit modal with item data
function openEditModal(id) {
    const item = inventory.find(item => item.id === id);
    if (item) {
        document.getElementById('edit-item-id').value = item.id;
        document.getElementById('edit-item-name').value = item.name;
        document.getElementById('edit-item-category').value = item.category;
        document.getElementById('edit-item-quantity').value = item.quantity;
        document.getElementById('edit-item-price').value = item.price;
        document.getElementById('edit-item-description').value = item.description;
        document.getElementById('edit-reorder-level').value = item.reorderLevel;

        editItemModal.style.display = 'flex';
    }
}

// Open delete confirmation modal
function openDeleteModal(id) {
    selectedItemId = id;
    deleteModal.style.display = 'flex';
}

// Handle search
function handleSearch() {
    searchTerm = searchInput.value.trim();
    currentPage = 1;
    renderInventory();
}

// Save inventory to localStorage
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);