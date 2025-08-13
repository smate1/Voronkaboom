// Existing Tariffs functionality
document.addEventListener('DOMContentLoaded', function () {
	// Tariff data
	const existingTariffs = [
		{
			id: 'basic',
			name: 'Тарифный план "Базовый" Бесплатный 10 дней',
			type: 'Бесплатный период',
			price: 'Бесплатно',
			description: 'Пробный период на 10 дней',
		},
		{
			id: 'business',
			name: 'Тарифный план "Мой Бизнес"',
			type: 'Подписка',
			price: '29.99 USD',
			description: 'Для развития бизнеса',
		},
		{
			id: 'boss',
			name: 'Тарифный план "Большой Бос"',
			type: 'Подписка',
			price: '99.99 USD',
			description: 'Премиум возможности',
		},
		{
			id: 'newyear',
			name: 'Тарифный план "Новогодний - супер скидка"',
			type: 'Разовая оплата',
			price: '49.99 USD',
			description: 'Специальное предложение',
		},
	]

	// Elements
	const newTariffTab = document.getElementById('newTariffTab')
	const existingTariffTab = document.getElementById('existingTariffTab')
	const newTariffContent = document.getElementById('newTariffContent')
	const existingTariffContent = document.getElementById('existingTariffContent')
	const existingTariffsList = document.getElementById('existingTariffsList')
	const selectedTariffDetails = document.getElementById('selectedTariffDetails')

	let selectedTariff = null

	// Initialize existing tariffs functionality
	function initExistingTariffs() {
		createTariffDropdown()
		bindTabEvents()
	}

	// Create tariff dropdown
	function createTariffDropdown() {
		if (!existingTariffsList) return

		const dropdownHTML = `
            <div class="tariff-select">
                <button class="tariff-btn" id="tariffBtn">
                    <span class="tariff-text">Выберите тариф</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M8.85892 2.26811L5 6.29356L1.14108 2.26811C0.836791 1.91808 0.532503 1.91078 0.228216 2.24624C-0.076072 2.58169 -0.076072 2.90985 0.228216 3.23072L4.54357 7.78123C4.65422 7.92708 4.80636 8 5 8C5.19364 8 5.34578 7.92708 5.45643 7.78123L9.77178 3.23072C10.0761 2.90985 10.0761 2.58169 9.77178 2.24624C9.4675 1.91078 9.16321 1.91808 8.85892 2.26811Z" fill="#2B3034" fill-opacity="0.4"/>
                    </svg>
                </button>
                <div class="tariff-dropdown" id="tariffDropdown">
                    ${existingTariffs
											.map(
												tariff => `
                        <div class="tariff-option" data-id="${tariff.id}">
                            <div class="tariff-option-name">${tariff.name}</div>
                        </div>
                    `
											)
											.join('')}
                </div>
            </div>
        `

		existingTariffsList.innerHTML = dropdownHTML

		// Bind dropdown events
		bindDropdownEvents()
	}

	// Bind dropdown events
	function bindDropdownEvents() {
		const tariffBtn = document.getElementById('tariffBtn')
		const tariffDropdown = document.getElementById('tariffDropdown')
		const tariffOptions = document.querySelectorAll('.tariff-option')

		if (tariffBtn && tariffDropdown) {
			// Toggle dropdown
			tariffBtn.addEventListener('click', e => {
				e.stopPropagation()
				tariffDropdown.classList.toggle('show')
				tariffBtn.classList.toggle('open')
			})

			// Close dropdown when clicking outside
			document.addEventListener('click', e => {
				if (!e.target.closest('.tariff-select')) {
					tariffDropdown.classList.remove('show')
					tariffBtn.classList.remove('open')
				}
			})

			// Handle tariff selection
			tariffOptions.forEach(option => {
				option.addEventListener('click', () => {
					const tariffId = option.getAttribute('data-id')
					selectTariff(tariffId)
					tariffDropdown.classList.remove('show')
					tariffBtn.classList.remove('open')
				})
			})
		}
	}

	// Select tariff
	function selectTariff(tariffId) {
		selectedTariff = existingTariffs.find(tariff => tariff.id === tariffId)

		if (selectedTariff) {
			// Update dropdown button text
			const tariffText = document.querySelector('.tariff-text')
			if (tariffText) {
				tariffText.textContent = selectedTariff.name
			}

			// Remove selected class from all options
			document.querySelectorAll('.tariff-option').forEach(option => {
				option.classList.remove('selected')
			})

			// Add selected class to chosen option
			const selectedOption = document.querySelector(`[data-id="${tariffId}"]`)
			if (selectedOption) {
				selectedOption.classList.add('selected')
			}

			// Show tariff details
			showTariffDetails(selectedTariff)
		}
	}

	// Show tariff details
	function showTariffDetails(tariff) {
		if (!selectedTariffDetails) return

		document.getElementById('detailName').textContent = tariff.name
		document.getElementById('detailType').textContent = tariff.type
		document.getElementById('detailPrice').textContent = tariff.price
		document.getElementById('detailDescription').textContent =
			tariff.description

		selectedTariffDetails.style.display = 'block'
	}

	// Bind tab events
	function bindTabEvents() {
		if (newTariffTab && existingTariffTab) {
			newTariffTab.addEventListener('click', () => {
				switchTab('new')
			})

			existingTariffTab.addEventListener('click', () => {
				switchTab('existing')
			})
		}
	}

	// Switch tabs
	function switchTab(tabType) {
		// Update tab states
		const tabs = document.querySelectorAll('.tariff-tab')
		tabs.forEach(tab => tab.classList.remove('active'))

		if (tabType === 'new') {
			newTariffTab.classList.add('active')
			newTariffContent.style.display = 'block'
			existingTariffContent.style.display = 'none'
		} else {
			existingTariffTab.classList.add('active')
			newTariffContent.style.display = 'none'
			existingTariffContent.style.display = 'block'
		}
	}

	// Initialize when DOM is ready
	initExistingTariffs()
})
