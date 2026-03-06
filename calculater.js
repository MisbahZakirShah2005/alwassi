
        // Islamic Inheritance Calculator Logic
        class IslamicInheritanceCalculator {
            constructor() {
                this.heirs = [];
                this.totalEstate = 0;
                this.netEstate = 0;
            }

            calculateInheritance(data) {
                this.heirs = [];
                this.totalEstate = parseFloat(data.estateValue) || 0;
                
                // Subtract debts and funeral expenses
                const debts = parseFloat(data.totalDebts) || 0;
                const funeralExpenses = parseFloat(data.funeralExpenses) || 0;
                this.netEstate = this.totalEstate - debts - funeralExpenses;

                if (this.netEstate <= 0) {
                    throw new Error('Net estate must be positive after deducting debts and expenses');
                }

                const gender = data.deceasedGender;
                const numSons = parseInt(data.numSons) || 0;
                const numDaughters = parseInt(data.numDaughters) || 0;
                const numWives = gender === 'male' ? parseInt(data.numWives) || 0 : 0;
                const husbandAlive = gender === 'female' && data.husbandAlive === 'yes';
                const fatherAlive = data.fatherAlive === 'yes';
                const motherAlive = data.motherAlive === 'yes';
                const numBrothers = parseInt(data.numBrothers) || 0;
                const numSisters = parseInt(data.numSisters) || 0;

                const hasChildren = numSons > 0 || numDaughters > 0;
                const hasSpouse = numWives > 0 || husbandAlive;

                // Calculate spouse shares first
                if (hasSpouse) {
                    if (numWives > 0) {
                        // Wives' share
                        const wivesShare = hasChildren ? 1/8 : 1/4;
                        const sharePerWife = wivesShare / numWives;
                        
                        for (let i = 1; i <= numWives; i++) {
                            this.heirs.push({
                                relation: `Wife ${i}`,
                                relationUrdu: `بیوی ${i}`,
                                share: sharePerWife,
                                amount: this.netEstate * sharePerWife,
                                basis: hasChildren ? '1/8 (with children)' : '1/4 (no children)',
                                basisUrdu: hasChildren ? '1/8 (اولاد کے ساتھ)' : '1/4 (بغیر اولاد)'
                            });
                        }
                    }

                    if (husbandAlive) {
                        // Husband's share
                        const husbandShare = hasChildren ? 1/4 : 1/2;
                        this.heirs.push({
                            relation: 'Husband',
                            relationUrdu: 'شوہر',
                            share: husbandShare,
                            amount: this.netEstate * husbandShare,
                            basis: hasChildren ? '1/4 (with children)' : '1/2 (no children)',
                            basisUrdu: hasChildren ? '1/4 (اولاد کے ساتھ)' : '1/2 (بغیر اولاد)'
                        });
                    }
                }

                // Calculate parents' shares
                if (fatherAlive) {
                    const fatherShare = hasChildren ? 1/6 : 0; // Father gets residue if no children
                    if (hasChildren) {
                        this.heirs.push({
                            relation: 'Father',
                            relationUrdu: 'والد',
                            share: fatherShare,
                            amount: this.netEstate * fatherShare,
                            basis: '1/6 (with children)',
                            basisUrdu: '1/6 (اولاد کے ساتھ)'
                        });
                    }
                }

                if (motherAlive) {
                    let motherShare;
                    if (hasChildren || (numBrothers + numSisters) >= 2) {
                        motherShare = 1/6;
                    } else {
                        motherShare = 1/3;
                    }

                    this.heirs.push({
                        relation: 'Mother',
                        relationUrdu: 'والدہ',
                        share: motherShare,
                        amount: this.netEstate * motherShare,
                        basis: motherShare === 1/6 ? '1/6 (with children/siblings)' : '1/3 (no children/siblings)',
                        basisUrdu: motherShare === 1/6 ? '1/6 (اولاد/بہن بھائی کے ساتھ)' : '1/3 (بغیر اولاد/بہن بھائی)'
                    });
                }

                // Calculate children's shares
                if (hasChildren) {
                    if (numSons > 0) {
                        // Calculate remaining estate for children
                        const allocatedShares = this.heirs.reduce((sum, heir) => sum + heir.share, 0);
                        const childrenPortion = 1 - allocatedShares;
                        
                        // If father is alive and no children, he gets residue
                        if (!hasChildren && fatherAlive) {
                            this.heirs.push({
                                relation: 'Father',
                                relationUrdu: 'والد',
                                share: childrenPortion,
                                amount: this.netEstate * childrenPortion,
                                basis: 'Residue (no children)',
                                basisUrdu: 'باقی (بغیر اولاد)'
                            });
                        } else {
                            // Boys get double the share of girls
                            const totalShares = (numSons * 2) + numDaughters;
                            const sharePerUnit = childrenPortion / totalShares;
                            
                            // Sons
                            for (let i = 1; i <= numSons; i++) {
                                const sonShare = sharePerUnit * 2;
                                this.heirs.push({
                                    relation: `Son ${i}`,
                                    relationUrdu: `بیٹا ${i}`,
                                    share: sonShare,
                                    amount: this.netEstate * sonShare,
                                    basis: '2:1 ratio with daughters',
                                    basisUrdu: 'بیٹیوں کے ساتھ 2:1 کا تناسب'
                                });
                            }

                            // Daughters
                            for (let i = 1; i <= numDaughters; i++) {
                                this.heirs.push({
                                    relation: `Daughter ${i}`,
                                    relationUrdu: `بیٹی ${i}`,
                                    share: sharePerUnit,
                                    amount: this.netEstate * sharePerUnit,
                                    basis: '2:1 ratio with sons',
                                    basisUrdu: 'بیٹوں کے ساتھ 2:1 کا تناسب'
                                });
                            }
                        }
                    } else if (numDaughters > 0) {
                        // Only daughters, no sons
                        let daughtersShare;
                        if (numDaughters === 1) {
                            daughtersShare = 1/2;
                        } else {
                            daughtersShare = 2/3;
                        }

                        const sharePerDaughter = daughtersShare / numDaughters;
                        for (let i = 1; i <= numDaughters; i++) {
                            this.heirs.push({
                                relation: `Daughter ${i}`,
                                relationUrdu: `بیٹی ${i}`,
                                share: sharePerDaughter,
                                amount: this.netEstate * sharePerDaughter,
                                basis: numDaughters === 1 ? '1/2 (only daughter)' : '2/3 (multiple daughters)',
                                basisUrdu: numDaughters === 1 ? '1/2 (اکلوتی بیٹی)' : '2/3 (متعدد بیٹیاں)'
                            });
                        }
                    }
                }

                // Handle siblings (only if no children and father not alive)
                if (!hasChildren && !fatherAlive && (numBrothers > 0 || numSisters > 0)) {
                    const allocatedShares = this.heirs.reduce((sum, heir) => sum + heir.share, 0);
                    const siblingsResidue = Math.max(0, 1 - allocatedShares);
                    
                    if (siblingsResidue > 0) {
                        const totalSiblingShares = (numBrothers * 2) + numSisters;
                        const sharePerUnit = siblingsResidue / totalSiblingShares;
                        
                        // Brothers
                        for (let i = 1; i <= numBrothers; i++) {
                            const brotherShare = sharePerUnit * 2;
                            this.heirs.push({
                                relation: `Brother ${i}`,
                                relationUrdu: `بھائی ${i}`,
                                share: brotherShare,
                                amount: this.netEstate * brotherShare,
                                basis: 'Residue - 2:1 with sisters',
                                basisUrdu: 'باقی - بہنوں کے ساتھ 2:1'
                            });
                        }

                        // Sisters
                        for (let i = 1; i <= numSisters; i++) {
                            this.heirs.push({
                                relation: `Sister ${i}`,
                                relationUrdu: `بہن ${i}`,
                                share: sharePerUnit,
                                amount: this.netEstate * sharePerUnit,
                                basis: 'Residue - 2:1 with brothers',
                                basisUrdu: 'باقی - بھائیوں کے ساتھ 2:1'
                            });
                        }
                    }
                }

                // Handle father's residue if no children
                if (!hasChildren && fatherAlive) {
                    const allocatedShares = this.heirs.reduce((sum, heir) => sum + heir.share, 0);
                    const fatherResidue = Math.max(0, 1 - allocatedShares);
                    
                    if (fatherResidue > 0) {
                        // Check if father already has a share, if so, add to it
                        const existingFather = this.heirs.find(h => h.relation === 'Father');
                        if (existingFather) {
                            existingFather.share += fatherResidue;
                            existingFather.amount = this.netEstate * existingFather.share;
                            existingFather.basis = '1/6 + Residue';
                            existingFather.basisUrdu = '1/6 + باقی';
                        } else {
                            this.heirs.push({
                                relation: 'Father',
                                relationUrdu: 'والد',
                                share: fatherResidue,
                                amount: this.netEstate * fatherResidue,
                                basis: 'Residue (no children)',
                                basisUrdu: 'باقی (بغیر اولاد)'
                            });
                        }
                    }
                }

                return {
                    netEstate: this.netEstate,
                    heirs: this.heirs,
                    totalAllocated: this.heirs.reduce((sum, heir) => sum + heir.share, 0)
                };
            }
        }

        // Initialize calculator
        const calculator = new IslamicInheritanceCalculator();

        // Language toggle functionality
        document.getElementById('langToggle').addEventListener('click', function() {
            document.body.classList.toggle('urdu-mode');
        });

        // Form validation
        function validateForm() {
            const estateValue = document.getElementById('estateValue').value;
            const deceasedGender = document.getElementById('deceasedGender').value;
            
            if (!estateValue || estateValue <= 0) {
                showError('Please enter a valid estate value');
                return false;
            }
            
            if (!deceasedGender) {
                showError('Please select the gender of the deceased');
                return false;
            }

            return true;
        }

        // Show error message
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            errorText.textContent = message;
            errorDiv.classList.add('show');
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 5000);
        }

        // Collect form data
        function collectFormData() {
            return {
                deceasedGender: document.getElementById('deceasedGender').value,
                estateValue: document.getElementById('estateValue').value,
                numWives: document.getElementById('numWives').value,
                husbandAlive: document.getElementById('husbandAlive').value,
                numSons: document.getElementById('numSons').value,
                numDaughters: document.getElementById('numDaughters').value,
                fatherAlive: document.getElementById('fatherAlive').value,
                motherAlive: document.getElementById('motherAlive').value,
                numBrothers: document.getElementById('numBrothers').value,
                numSisters: document.getElementById('numSisters').value,
                totalDebts: document.getElementById('totalDebts').value,
                funeralExpenses: document.getElementById('funeralExpenses').value
            };
        }

        // Format currency
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace('PKR', '').trim();
        }

        // Display results
        function displayResults(results) {
            const resultsDiv = document.getElementById('results');
            const netEstateSpan = document.getElementById('netEstate');
            const netEstateUrduSpan = document.getElementById('netEstateUrdu');
            const inheritanceGrid = document.getElementById('inheritanceGrid');

            // Update net estate
            netEstateSpan.textContent = formatCurrency(results.netEstate);
            netEstateUrduSpan.textContent = formatCurrency(results.netEstate);

            // Clear previous results
            inheritanceGrid.innerHTML = '';

            // Add heir results
            results.heirs.forEach(heir => {
                const heirDiv = document.createElement('div');
                heirDiv.className = 'heir-result';
                
                const percentage = (heir.share * 100).toFixed(2);
                
                heirDiv.innerHTML = `
                    <div class="heir-info">
                        <h4 class="content-english">${heir.relation}</h4>
                        <h4 class="content-urdu urdu-text">${heir.relationUrdu}</h4>
                        <p class="content-english">${heir.basis}</p>
                        <p class="content-urdu urdu-text">${heir.basisUrdu}</p>
                    </div>
                    <div class="heir-share">
                        <div class="heir-amount">PKR ${formatCurrency(heir.amount)}</div>
                        <div class="heir-percentage">${percentage}%</div>
                    </div>
                `;
                
                inheritanceGrid.appendChild(heirDiv);
            });

            // Show results with animation
            resultsDiv.classList.add('show');
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }

        // Calculate button event listener
        document.getElementById('calculateBtn').addEventListener('click', function() {
            if (!validateForm()) {
                return;
            }

            const btn = this;
            const loading = document.getElementById('loading');
            const results = document.getElementById('results');

            // Show loading
            btn.disabled = true;
            loading.style.display = 'block';
            results.classList.remove('show');

            // Simulate calculation delay for better UX
            setTimeout(() => {
                try {
                    const formData = collectFormData();
                    const inheritanceResults = calculator.calculateInheritance(formData);
                    
                    // Hide loading
                    loading.style.display = 'none';
                    btn.disabled = false;
                    
                    // Display results
                    displayResults(inheritanceResults);
                    
                } catch (error) {
                    loading.style.display = 'none';
                    btn.disabled = false;
                    showError(error.message);
                }
            }, 1500);
        });

        // Input event listeners for real-time validation
        document.getElementById('estateValue').addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value && value > 0) {
                this.style.borderColor = '#48bb78';
            } else {
                this.style.borderColor = '#f56565';
            }
        });

        // Gender change handler
        document.getElementById('deceasedGender').addEventListener('change', function() {
            const gender = this.value;
            const wivesField = document.getElementById('numWives').closest('.form-field');
            const husbandField = document.getElementById('husbandAlive').closest('.form-field');
            
            if (gender === 'male') {
                wivesField.style.display = 'flex';
                husbandField.style.display = 'none';
                document.getElementById('husbandAlive').value = 'no';
            } else if (gender === 'female') {
                wivesField.style.display = 'none';
                husbandField.style.display = 'flex';
                document.getElementById('numWives').value = '0';
            } else {
                wivesField.style.display = 'flex';
                husbandField.style.display = 'flex';
            }
        });

        // Initialize form state
        document.getElementById('deceasedGender').dispatchEvent(new Event('change'));

        // Add some sample data for demo
        document.getElementById('estateValue').value = '1000000';
        document.getElementById('deceasedGender').value = 'male';
        document.getElementById('numWives').value = '1';
        document.getElementById('numSons').value = '2';
        document.getElementById('numDaughters').value = '1';
        document.getElementById('fatherAlive').value = 'yes';
        document.getElementById('motherAlive').value = 'yes';
