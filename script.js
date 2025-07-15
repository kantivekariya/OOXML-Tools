class OOXMLTools {
    constructor() {
        this.currentMode = 'viewer';
        this.loadedFiles = {};
        this.currentFilePath = null;
        this.isEditing = false;
        this.isScrolling = false;
        
        this.initializeEventListeners();
        this.updateModeUI();
        this.setupInitialCardListeners();
    }

    initializeEventListeners() {
        // Mode switching
        document.getElementById('viewerMode').addEventListener('click', () => this.switchMode('viewer'));
        document.getElementById('compareMode').addEventListener('click', () => this.switchMode('compare'));

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // Clear comparison
        document.getElementById('clearComparison').addEventListener('click', () => this.clearComparison());

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentFile());

        // Global remove file function
        window.removeFile = (fileKey) => this.removeFile(fileKey);
        window.removeFileFromCard = (fileKey) => this.removeFileFromCard(fileKey);
    }

    setupInitialCardListeners() {
        // Set up initial click listeners for empty cards
        // Explorer mode card
        const explorerCard = document.getElementById('fileCard1');
        const explorerInput = document.getElementById('fileInput1');
        if (explorerCard && explorerInput) {
            explorerInput.addEventListener('change', (e) => this.handleFileSelect(e, 'file1'));
            explorerCard.onclick = () => explorerInput.click();
        }

        // Compare mode cards (if they exist)
        const compareCard1 = document.getElementById('fileCard1Compare');
        const compareInput1 = document.getElementById('fileInput1Compare');
        if (compareCard1 && compareInput1) {
            compareInput1.addEventListener('change', (e) => this.handleFileSelect(e, 'file1'));
            compareCard1.onclick = () => compareInput1.click();
        }

        const compareCard2 = document.getElementById('fileCard2Compare');
        const compareInput2 = document.getElementById('fileInput2Compare');
        if (compareCard2 && compareInput2) {
            compareInput2.addEventListener('change', (e) => this.handleFileSelect(e, 'file2'));
            compareCard2.onclick = () => compareInput2.click();
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.updateModeUI();
        this.resetInterface();
        
        // Show appropriate upload section
        const explorerUploadSection = document.getElementById('explorerUploadSection');
        const compareUploadSection = document.getElementById('compareUploadSection');
        
        if (mode === 'compare') {
            explorerUploadSection.classList.add('hidden');
            compareUploadSection.classList.remove('hidden');
            this.updateCompareCards();
        } else {
            explorerUploadSection.classList.remove('hidden');
            compareUploadSection.classList.add('hidden');
            this.updateExplorerCard();
        }

        // If we have files loaded, show appropriate interface
        if (mode === 'compare' && Object.keys(this.loadedFiles).length >= 2) {
            this.showComparisonMode();
        } else if (mode === 'viewer' && Object.keys(this.loadedFiles).length >= 1) {
            this.showViewerMode();
        }
        
        // Re-setup card listeners after mode switch to ensure they work
        setTimeout(() => this.setupInitialCardListeners(), 0);
    }

    updateModeUI() {
        const viewerBtn = document.getElementById('viewerMode');
        const compareBtn = document.getElementById('compareMode');
        
        if (this.currentMode === 'viewer') {
            viewerBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors';
            compareBtn.className = 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors';
        } else {
            viewerBtn.className = 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors';
            compareBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors';
        }
    }

    resetInterface() {
        document.getElementById('uploadArea').classList.remove('hidden');
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('viewerContent').classList.add('hidden');
        document.getElementById('compareContent').classList.add('hidden');
        document.getElementById('fileTabs').classList.add('hidden');
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('border-blue-400');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('border-blue-400');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('border-blue-400');
        
        const files = Array.from(e.dataTransfer.files);
        const ooxmlFiles = files.filter(file => this.isOOXMLFile(file));
        
        if (ooxmlFiles.length === 0) {
            this.showToast('Please drop valid OOXML files (.docx, .xlsx, .pptx, etc.)', 'error');
            return;
        }

        if (this.currentMode === 'compare') {
            const fileKeys = Object.keys(this.loadedFiles);
            if (ooxmlFiles.length >= 2) {
                this.loadFile(ooxmlFiles[0], 'file1');
                setTimeout(() => this.loadFile(ooxmlFiles[1], 'file2'), 100);
            } else if (ooxmlFiles.length === 1) {
                if (fileKeys.length === 0) {
                    this.loadFile(ooxmlFiles[0], 'file1');
                } else if (!fileKeys.includes('file2')) {
                    this.loadFile(ooxmlFiles[0], 'file2');
                } else {
                    // Replace file1 if both slots are taken
                    this.loadFile(ooxmlFiles[0], 'file1');
                }
            }
        } else if (ooxmlFiles.length > 0) {
            this.loadFile(ooxmlFiles[0], 'file1');
        }
    }

    handleFileSelect(e, fileKey) {
        const file = e.target.files[0];
        if (file && this.isOOXMLFile(file)) {
            this.loadFile(file, fileKey);
        } else if (file) {
            this.showToast('❌ Please select a valid OOXML file (.docx, .xlsx, .pptx, etc.)', 'error');
        }
        // Reset file input
        e.target.value = '';
    }

    isOOXMLFile(file) {
        const ooxmlExtensions = ['.docx', '.xlsx', '.pptx', '.dotx', '.xltx', '.potx'];
        return ooxmlExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    async loadFile(file, fileKey) {
        try {
            this.showLoading();
            
            const zip = await JSZip.loadAsync(file);
            this.loadedFiles[fileKey] = {
                name: file.name,
                zip: zip,
                files: {}
            };

            // Extract all XML files
            for (const fileName in zip.files) {
                if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
                    const content = await zip.files[fileName].async('text');
                    this.loadedFiles[fileKey].files[fileName] = content;
                }
            }

            this.hideLoading();

            // Update card UI based on current mode
            if (this.currentMode === 'compare') {
                this.updateCompareCards();
                if (Object.keys(this.loadedFiles).length >= 2) {
                    this.showComparisonMode();
                }
            } else {
                this.updateExplorerCard();
                this.showViewerMode();
            }

            this.showToast(`✅ Loaded ${file.name} successfully`, 'success');
        } catch (error) {
            this.hideLoading();
            this.showToast(`❌ Error loading file: ${error.message}`, 'error');
        }
    }

    showViewerMode() {
        document.getElementById('uploadArea').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('viewerContent').classList.remove('hidden');
        
        this.buildFileTree();
        
        // Update file info
        const fileData = this.loadedFiles[Object.keys(this.loadedFiles)[0]];
        const fileCount = Object.keys(fileData.files).length;
        document.getElementById('fileInfo').textContent = `${fileData.name} (${fileCount} XML files)`;
    }

    showComparisonMode() {
        document.getElementById('uploadArea').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('compareContent').classList.remove('hidden');
        document.getElementById('fileTabs').classList.remove('hidden');
        
        this.buildComparisonFileTree();
        this.setupSynchronizedScrolling();
    }

    updateCompareUI() {
        const fileKeys = Object.keys(this.loadedFiles);
        
        // Update file tabs
        if (fileKeys.length >= 1) {
            const tab1 = document.getElementById('fileTab1');
            tab1.querySelector('span').textContent = this.loadedFiles[fileKeys[0]].name;
            tab1.classList.remove('hidden');
        }
        
        if (fileKeys.length >= 2) {
            const tab2 = document.getElementById('fileTab2');
            tab2.querySelector('span').textContent = this.loadedFiles[fileKeys[1]].name;
            tab2.classList.remove('hidden');
        }

        // Update comparison titles
        if (fileKeys.length >= 1) {
            document.getElementById('compareTitle1').textContent = this.loadedFiles[fileKeys[0]].name;
        }
        if (fileKeys.length >= 2) {
            document.getElementById('compareTitle2').textContent = this.loadedFiles[fileKeys[1]].name;
        }
    }

    updateExplorerCard() {
        const fileKeys = Object.keys(this.loadedFiles);
        const card = document.getElementById('fileCard1');
        
        if (fileKeys.length > 0) {
            const fileName = this.loadedFiles[fileKeys[0]].name;
            card.innerHTML = `
                <div class="flex items-center justify-between p-2">
                    <div class="flex items-center space-x-3">
                        <div class="text-3xl">📄</div>
                        <div>
                            <div class="font-medium text-gray-800">${fileName}</div>
                            <div class="text-sm text-gray-500">Ready to explore</div>
                        </div>
                    </div>
                    <button onclick="removeFileFromCard('file1')" class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            card.className = 'bg-blue-50 border-2 border-blue-300 rounded-lg hover:border-blue-400 transition-colors';
            card.style.cursor = 'default';
            // Clear any click event listeners when file is loaded
            card.onclick = null;
        } else {
            card.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="text-4xl mb-3">📄</div>
                    <span class="text-gray-600 font-medium">Select OOXML File</span>
                    <input type="file" id="fileInput1" class="hidden" accept=".docx,.xlsx,.pptx,.dotx,.xltx,.potx">
                </div>
            `;
            card.className = 'bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors cursor-pointer';
            
            // Set up event listeners for the newly created input element
            const input = document.getElementById('fileInput1');
            if (input) {
                input.addEventListener('change', (e) => this.handleFileSelect(e, 'file1'));
                card.onclick = () => input.click();
            }
        }
    }

    updateCompareCards() {
        const fileKeys = Object.keys(this.loadedFiles);
        
        // Update File 1 Card
        this.updateCompareCard('fileCard1Compare', 'fileInput1Compare', 'file1', fileKeys.includes('file1') ? this.loadedFiles.file1 : null, 'First File', 'blue');
        
        // Update File 2 Card
        this.updateCompareCard('fileCard2Compare', 'fileInput2Compare', 'file2', fileKeys.includes('file2') ? this.loadedFiles.file2 : null, 'Second File', 'green');
    }

    updateCompareCard(cardId, inputId, fileKey, fileData, placeholder, color) {
        const card = document.getElementById(cardId);
        
        if (fileData) {
            card.innerHTML = `
                <div class="flex items-center justify-between h-32 p-2">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <div class="text-2xl">📄</div>
                        <div class="min-w-0 flex-1">
                            <div class="font-medium text-gray-800 truncate">${fileData.name}</div>
                            <div class="text-sm text-gray-500">Ready to compare</div>
                        </div>
                    </div>
                    <button onclick="removeFileFromCard('${fileKey}')" class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            // Set specific classes based on color
            if (color === 'blue') {
                card.className = 'bg-blue-50 border-2 border-blue-300 rounded-lg hover:border-blue-400 transition-colors';
            } else if (color === 'green') {
                card.className = 'bg-green-50 border-2 border-green-300 rounded-lg hover:border-green-400 transition-colors';
            }
            
            // Remove click functionality when file is loaded
            card.style.cursor = 'default';
            // Clear any click event listeners
            card.onclick = null;
        } else {
            card.innerHTML = `
                <div class="flex flex-col items-center justify-center h-32">
                    <div class="text-3xl mb-2">📄</div>
                    <span class="text-gray-600 font-medium text-center">Select ${placeholder}</span>
                    <input type="file" id="${inputId}" class="hidden" accept=".docx,.xlsx,.pptx,.dotx,.xltx,.potx">
                </div>
            `;
            
            // Set specific classes based on color
            if (color === 'blue') {
                card.className = 'bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer';
            } else if (color === 'green') {
                card.className = 'bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors cursor-pointer';
            }
            
            // Set up event listeners for the newly created elements
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', (e) => this.handleFileSelect(e, fileKey));
                card.onclick = () => input.click();
            }
        }
    }

    removeFileFromCard(fileKey) {
        delete this.loadedFiles[fileKey];
        
        if (this.currentMode === 'compare') {
            this.updateCompareCards();
            if (Object.keys(this.loadedFiles).length < 2) {
                this.resetInterface();
            } else {
                this.buildComparisonFileTree();
            }
        } else {
            this.updateExplorerCard();
            this.resetInterface();
        }
        
        this.showToast(`🗑️ File removed`, 'info');
    }

    buildFileTree() {
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = '';
        
        const fileData = this.loadedFiles[Object.keys(this.loadedFiles)[0]];
        const files = Object.keys(fileData.files).sort();
        
        const tree = this.buildTreeStructure(files);
        this.renderTreeNode(tree, fileTree, '');
    }

    buildComparisonFileTree() {
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = '';
        
        const fileKeys = Object.keys(this.loadedFiles);
        if (fileKeys.length < 2) return;
        
        const file1 = this.loadedFiles[fileKeys[0]];
        const file2 = this.loadedFiles[fileKeys[1]];
        
        const allFiles = new Set([...Object.keys(file1.files), ...Object.keys(file2.files)]);
        const tree = this.buildTreeStructure(Array.from(allFiles));
        this.renderComparisonTreeNode(tree, fileTree, '', file1, file2);
        
        // Update file info
        document.getElementById('fileInfo').textContent = `Comparing ${file1.name} vs ${file2.name}`;
    }

    buildTreeStructure(filePaths) {
        const tree = {};
        
        filePaths.forEach(filePath => {
            const parts = filePath.split('/');
            let current = tree;
            
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = {
                        isFile: index === parts.length - 1,
                        fullPath: parts.slice(0, index + 1).join('/'),
                        children: {}
                    };
                }
                current = current[part].children;
            });
        });
        
        return tree;
    }

    renderTreeNode(node, container, prefix) {
        Object.keys(node).sort().forEach(key => {
            const item = node[key];
            const itemElement = document.createElement('div');
            
            if (item.isFile) {
                itemElement.className = 'tree-item flex items-center p-2 cursor-pointer text-editor-text hover:bg-gray-700 rounded';
                itemElement.innerHTML = `
                    <span class="mr-2">📄</span>
                    <span class="text-sm">${key}</span>
                `;
                itemElement.addEventListener('click', () => this.selectFile(item.fullPath));
            } else {
                const hasChildren = Object.keys(item.children).length > 0;
                itemElement.className = 'tree-item';
                
                const folderDiv = document.createElement('div');
                folderDiv.className = 'flex items-center p-2 cursor-pointer text-editor-text hover:bg-gray-700 rounded';
                folderDiv.innerHTML = `
                    <span class="mr-1 text-xs transform transition-transform ${hasChildren ? 'rotate-0' : ''}" data-expand="▶">▶</span>
                    <span class="mr-2">📁</span>
                    <span class="text-sm font-medium">${key}</span>
                `;
                
                if (hasChildren) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'ml-4 hidden';
                    
                    folderDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleFolder(folderDiv, childrenContainer);
                    });
                    
                    this.renderTreeNode(item.children, childrenContainer, prefix + key + '/');
                    
                    itemElement.appendChild(folderDiv);
                    itemElement.appendChild(childrenContainer);
                } else {
                    itemElement.appendChild(folderDiv);
                }
            }
            
            container.appendChild(itemElement);
        });
    }

    renderComparisonTreeNode(node, container, prefix, file1, file2) {
        Object.keys(node).sort().forEach(key => {
            const item = node[key];
            const itemElement = document.createElement('div');
            
            if (item.isFile) {
                const inFile1 = file1.files.hasOwnProperty(item.fullPath);
                const inFile2 = file2.files.hasOwnProperty(item.fullPath);
                
                let status = '';
                let statusClass = '';
                let icon = '📄';
                
                if (inFile1 && inFile2) {
                    const content1 = file1.files[item.fullPath];
                    const content2 = file2.files[item.fullPath];
                    if (content1 !== content2) {
                        status = ' (Modified)';
                        statusClass = 'text-yellow-400';
                        icon = '📝';
                    }
                } else if (inFile1 && !inFile2) {
                    status = ' (Removed)';
                    statusClass = 'text-red-400 line-through';
                    icon = '🗑️';
                } else if (!inFile1 && inFile2) {
                    status = ' (Added)';
                    statusClass = 'text-green-400';
                    icon = '✨';
                }
                
                itemElement.className = 'tree-item flex items-center p-2 cursor-pointer text-editor-text hover:bg-gray-700 rounded';
                itemElement.innerHTML = `
                    <span class="mr-2">${icon}</span>
                    <span class="text-sm ${statusClass}">${key}${status}</span>
                `;
                itemElement.addEventListener('click', () => this.showComparison(item.fullPath, file1, file2));
            } else {
                const hasChildren = Object.keys(item.children).length > 0;
                itemElement.className = 'tree-item';
                
                const folderDiv = document.createElement('div');
                folderDiv.className = 'flex items-center p-2 cursor-pointer text-editor-text hover:bg-gray-700 rounded';
                folderDiv.innerHTML = `
                    <span class="mr-1 text-xs transform transition-transform" data-expand="▶">▶</span>
                    <span class="mr-2">📁</span>
                    <span class="text-sm font-medium">${key}</span>
                `;
                
                if (hasChildren) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'ml-4 hidden';
                    
                    folderDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleFolder(folderDiv, childrenContainer);
                    });
                    
                    this.renderComparisonTreeNode(item.children, childrenContainer, prefix + key + '/', file1, file2);
                    
                    itemElement.appendChild(folderDiv);
                    itemElement.appendChild(childrenContainer);
                } else {
                    itemElement.appendChild(folderDiv);
                }
            }
            
            container.appendChild(itemElement);
        });
    }

    toggleFolder(folderElement, childrenContainer) {
        const expandIcon = folderElement.querySelector('[data-expand]');
        const isExpanded = !childrenContainer.classList.contains('hidden');
        
        if (isExpanded) {
            childrenContainer.classList.add('hidden');
            expandIcon.classList.remove('rotate-90');
        } else {
            childrenContainer.classList.remove('hidden');
            expandIcon.classList.add('rotate-90');
        }
    }

    selectFile(filePath) {
        // Update selection
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('bg-blue-600');
        });
        event.currentTarget.classList.add('bg-blue-600');
        
        this.currentFilePath = filePath;
        const fileData = this.loadedFiles[Object.keys(this.loadedFiles)[0]];
        const content = fileData.files[filePath];
        
        document.getElementById('contentTitle').textContent = filePath;
        
        const formattedXML = this.formatXML(content);
        this.displayFormattedXML(formattedXML);
        
        this.isEditing = false;
        this.updateSaveButton();
    }

    showComparison(filePath, file1, file2) {
        // Update selection
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('bg-blue-600');
        });
        event.currentTarget.classList.add('bg-blue-600');
        
        const content1 = file1.files[filePath] || '(File not present)';
        const content2 = file2.files[filePath] || '(File not present)';
        
        const formatted1 = this.formatXML(content1);
        const formatted2 = this.formatXML(content2);
        
        // Generate professional diff
        const diffResult = this.generateProfessionalDiff(formatted1, formatted2);
        
        document.getElementById('compareContent1').innerHTML = diffResult.left;
        document.getElementById('compareContent2').innerHTML = diffResult.right;
        
        // Update diff stats
        this.updateDiffStats(diffResult.stats);
        
        // Setup synchronized scrolling
        this.setupSynchronizedScrolling();
    }

    generateProfessionalDiff(content1, content2) {
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
        
        // Simple LCS-based diff algorithm
        const diff = this.computeDiff(lines1, lines2);
        
        let leftHtml = '';
        let rightHtml = '';
        let stats = { added: 0, removed: 0, modified: 0 };
        
        let lineNum1 = 1;
        let lineNum2 = 1;
        
        diff.forEach(change => {
            if (change.type === 'equal') {
                const line = this.applySyntaxHighlighting(change.value);
                leftHtml += `<div class="diff-line">
                    <span class="diff-line-number">${lineNum1}</span>${line}
                </div>`;
                rightHtml += `<div class="diff-line">
                    <span class="diff-line-number">${lineNum2}</span>${line}
                </div>`;
                lineNum1++;
                lineNum2++;
            } else if (change.type === 'delete') {
                const line = this.applySyntaxHighlighting(change.value);
                leftHtml += `<div class="diff-line bg-red-900 bg-opacity-50 border-l-4 border-red-500">
                    <span class="diff-line-number">${lineNum1}</span>${line}
                </div>`;
                rightHtml += `<div class="diff-line bg-gray-800 bg-opacity-50">
                    <span class="diff-line-number"></span>&nbsp;
                </div>`;
                lineNum1++;
                stats.removed++;
            } else if (change.type === 'insert') {
                const line = this.applySyntaxHighlighting(change.value);
                leftHtml += `<div class="diff-line bg-gray-800 bg-opacity-50">
                    <span class="diff-line-number"></span>&nbsp;
                </div>`;
                rightHtml += `<div class="diff-line bg-green-900 bg-opacity-50 border-l-4 border-green-500">
                    <span class="diff-line-number">${lineNum2}</span>${line}
                </div>`;
                lineNum2++;
                stats.added++;
            }
        });
        
        return {
            left: leftHtml,
            right: rightHtml,
            stats: stats
        };
    }

    computeDiff(lines1, lines2) {
        // Simple diff algorithm using LCS
        const m = lines1.length;
        const n = lines2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        // Build LCS table
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (lines1[i - 1] === lines2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        
        // Reconstruct diff
        const diff = [];
        let i = m, j = n;
        
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
                diff.unshift({ type: 'equal', value: lines1[i - 1] });
                i--;
                j--;
            } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
                diff.unshift({ type: 'delete', value: lines1[i - 1] });
                i--;
            } else {
                diff.unshift({ type: 'insert', value: lines2[j - 1] });
                j--;
            }
        }
        
        return diff;
    }

    updateDiffStats(stats) {
        const statsElement = document.getElementById('diffStats');
        statsElement.innerHTML = `
            <span class="text-green-600">+${stats.added}</span>
            <span class="text-red-600">-${stats.removed}</span>
        `;
    }

    setupSynchronizedScrolling() {
        const content1 = document.getElementById('compareContent1');
        const content2 = document.getElementById('compareContent2');
        
        // Remove existing listeners
        content1.removeEventListener('scroll', this.scrollHandler1);
        content2.removeEventListener('scroll', this.scrollHandler2);
        
        // Create new handlers
        this.scrollHandler1 = (e) => {
            if (!this.isScrolling) {
                this.isScrolling = true;
                content2.scrollTop = e.target.scrollTop;
                content2.scrollLeft = e.target.scrollLeft;
                setTimeout(() => this.isScrolling = false, 50);
            }
        };
        
        this.scrollHandler2 = (e) => {
            if (!this.isScrolling) {
                this.isScrolling = true;
                content1.scrollTop = e.target.scrollTop;
                content1.scrollLeft = e.target.scrollLeft;
                setTimeout(() => this.isScrolling = false, 50);
            }
        };
        
        content1.addEventListener('scroll', this.scrollHandler1);
        content2.addEventListener('scroll', this.scrollHandler2);
    }

    removeFile(fileKey) {
        delete this.loadedFiles[fileKey];
        
        if (this.currentMode === 'compare') {
            this.updateCompareCards();
            if (Object.keys(this.loadedFiles).length < 2) {
                this.resetInterface();
            } else {
                this.buildComparisonFileTree();
            }
        } else {
            this.updateExplorerCard();
            this.resetInterface();
        }
        
        this.showToast(`🗑️ File removed`, 'info');
    }

    clearComparison() {
        this.loadedFiles = {};
        if (this.currentMode === 'compare') {
            this.updateCompareCards();
        } else {
            this.updateExplorerCard();
        }
        this.resetInterface();
        this.showToast('🧹 Comparison cleared', 'info');
    }

    formatXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            const parseError = xmlDoc.getElementsByTagName("parsererror");
            if (parseError.length > 0) {
                return xmlString;
            }
            
            return this.prettifyXML(xmlDoc.documentElement, 0);
        } catch (error) {
            return xmlString;
        }
    }

    prettifyXML(node, indent = 0) {
        const indentStr = '  '.repeat(indent);
        let result = '';
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            result += indentStr + '<' + node.nodeName;
            
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                result += ` ${attr.name}="${attr.value}"`;
            }
            
            if (node.childNodes.length === 0) {
                result += '/>\n';
            } else {
                result += '>\n';
                
                for (let child of node.childNodes) {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        result += this.prettifyXML(child, indent + 1);
                    } else if (child.nodeType === Node.TEXT_NODE) {
                        const text = child.textContent.trim();
                        if (text) {
                            result += '  '.repeat(indent + 1) + text + '\n';
                        }
                    }
                }
                
                result += indentStr + '</' + node.nodeName + '>\n';
            }
        }
        
        return result;
    }

    displayFormattedXML(xmlContent) {
        const contentViewer = document.getElementById('contentViewer');
        const highlightedXML = this.applySyntaxHighlighting(xmlContent);
        contentViewer.innerHTML = highlightedXML;
    }

    applySyntaxHighlighting(xmlContent) {
        let highlighted = xmlContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // XML Declaration
        highlighted = highlighted.replace(
            /(&lt;\?xml[^&]*\?&gt;)/g,
            '<span class="xml-declaration">$1</span>'
        );

        // Comments
        highlighted = highlighted.replace(
            /(&lt;!--[\s\S]*?--&gt;)/g,
            '<span class="xml-comment">$1</span>'
        );

        // CDATA
        highlighted = highlighted.replace(
            /(&lt;!\[CDATA\[[\s\S]*?\]\]&gt;)/g,
            '<span class="xml-cdata">$1</span>'
        );

        // Elements with attributes
        highlighted = highlighted.replace(
            /(&lt;\/?)([a-zA-Z][a-zA-Z0-9:._-]*)((?:\s+[a-zA-Z][a-zA-Z0-9:._-]*\s*=\s*"[^"]*")*)\s*(\/?&gt;)/g,
            function(match, openBracket, elementName, attributes, closeBracket) {
                let result = '<span class="xml-bracket">' + openBracket + '</span>';
                result += '<span class="xml-element">' + elementName + '</span>';
                
                if (attributes) {
                    result += attributes.replace(
                        /(\s+)([a-zA-Z][a-zA-Z0-9:._-]*)\s*=\s*("[^"]*")/g,
                        '$1<span class="xml-attribute-name">$2</span>=<span class="xml-attribute-value">$3</span>'
                    );
                }
                
                result += '<span class="xml-bracket">' + closeBracket + '</span>';
                return result;
            }
        );

        return highlighted;
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveBtn');
        if (this.isEditing) {
            saveBtn.classList.remove('hidden');
        } else {
            saveBtn.classList.add('hidden');
        }
    }

    saveCurrentFile() {
        // Implementation for saving (if needed)
        this.showToast('💾 File saved successfully', 'success');
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        let bgColor = 'bg-blue-600';
        
        if (type === 'success') bgColor = 'bg-green-600';
        else if (type === 'error') bgColor = 'bg-red-600';
        else if (type === 'warning') bgColor = 'bg-yellow-600';
        
        toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ooxmlTools = new OOXMLTools();
}); 