// Sidebar expandable menu functionality
document.addEventListener('DOMContentLoaded', function () {
	// Get all expandable sidebar items
	const expandableItems = document.querySelectorAll(
		'.sidebar__item--expandable'
	)

	expandableItems.forEach(item => {
		const link = item.querySelector('.sidebar__link')
		const submenu = item.querySelector('.sidebar__submenu')

		if (link && submenu) {
			// Initially show the submenu (expanded state by default)
			item.classList.add('expanded')
			submenu.style.display = 'block'

			link.addEventListener('click', function (e) {
				e.preventDefault()

				// Toggle expanded state
				item.classList.toggle('expanded')

				// Toggle submenu visibility
				if (item.classList.contains('expanded')) {
					submenu.style.display = 'block'
					submenu.style.animation = 'slideDown 0.3s ease'
				} else {
					submenu.style.display = 'none'
				}
			})
		}
	})
})

// Add CSS animations for sidebar
const style = document.createElement('style')
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 200px;
        }
    }

    .sidebar__submenu {
        overflow: hidden;
        transition: all 0.3s ease;
    }
`
document.head.appendChild(style)

// Custom Calendar Implementation
class CustomCalendar {
	constructor() {
		this.currentDate = new Date()
		this.selectedStart = null
		this.selectedEnd = null
		this.tempEnd = null
		this.isSelecting = false
		this.previousStart = null
		this.previousEnd = null
		this.monthNames = [
			'Январь',
			'Февраль',
			'Март',
			'Апрель',
			'Май',
			'Июнь',
			'Июль',
			'Август',
			'Сентябрь',
			'Октябрь',
			'Ноябрь',
			'Декабрь',
		]

		this.init()
	}

	init() {
		this.bindEvents()
		this.setDefaultRange()
		this.renderCalendar()
	}

	bindEvents() {
		// Toggle calendar visibility
		const toggleBtn = document.getElementById('toggleCalendar')
		const calendarWrapper = document.getElementById('calendarWrapper')
		const calendarDisplay = document.getElementById('calendarDisplay')

		if (toggleBtn && calendarWrapper) {
			toggleBtn.addEventListener('click', e => {
				e.stopPropagation()
				if (!calendarWrapper.classList.contains('show')) {
					// Save current state before opening
					this.saveCurrentState()
				}
				calendarWrapper.classList.toggle('show')
			})

			// Prevent calendar from closing when clicking inside
			calendarWrapper.addEventListener('click', e => {
				e.stopPropagation()
			})
		}

		// Add click event to calendar display field
		if (calendarDisplay && calendarWrapper) {
			calendarDisplay.addEventListener('click', e => {
				e.stopPropagation()
				if (!calendarWrapper.classList.contains('show')) {
					// Save current state before opening
					this.saveCurrentState()
				}
				calendarWrapper.classList.toggle('show')
			})
		}

		// Month navigation
		const prevMonth = document.getElementById('prevMonth')
		const nextMonth = document.getElementById('nextMonth')

		if (prevMonth) {
			prevMonth.addEventListener('click', () => {
				this.currentDate.setMonth(this.currentDate.getMonth() - 1)
				this.renderCalendar()
			})
		}

		if (nextMonth) {
			nextMonth.addEventListener('click', () => {
				this.currentDate.setMonth(this.currentDate.getMonth() + 1)
				this.renderCalendar()
			})
		}

		// Apply button
		const applyBtn = document.getElementById('applyRange')
		if (applyBtn) {
			applyBtn.addEventListener('click', () => {
				this.applySelection()
			})
		}

		// Cancel button
		const cancelBtn = document.getElementById('cancelRange')
		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				this.cancelSelection()
			})
		}
	}

	setDefaultRange() {
		// Set default range: August 1, 2025 to September 30, 2025
		this.selectedStart = new Date(2025, 7, 1) // August 1, 2025
		this.selectedEnd = new Date(2025, 8, 30) // September 30, 2025
		this.currentDate = new Date(2025, 7, 1) // Start at August 2025
	}

	renderCalendar() {
		this.updateMonthYear()
		this.renderDates()
		this.updateSelectedRange()
	}

	updateMonthYear() {
		const monthYear = document.getElementById('monthYear')
		if (monthYear) {
			monthYear.textContent = `${
				this.monthNames[this.currentDate.getMonth()]
			} ${this.currentDate.getFullYear()}`
		}
	}

	renderDates() {
		const datesContainer = document.getElementById('calendarDates')
		if (!datesContainer) return

		datesContainer.innerHTML = ''

		const year = this.currentDate.getFullYear()
		const month = this.currentDate.getMonth()

		// First day of the month
		const firstDay = new Date(year, month, 1)
		// Last day of the month
		const lastDay = new Date(year, month + 1, 0)

		// Start from Monday
		const startDate = new Date(firstDay)
		const dayOfWeek = firstDay.getDay()
		const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
		startDate.setDate(firstDay.getDate() - daysToSubtract)

		// Generate 42 days (6 weeks)
		for (let i = 0; i < 42; i++) {
			const date = new Date(startDate)
			date.setDate(startDate.getDate() + i)

			const dateElement = this.createDateElement(date, month)
			datesContainer.appendChild(dateElement)
		}
	}

	createDateElement(date, currentMonth) {
		const dateElement = document.createElement('div')
		dateElement.className = 'calendar-date'
		dateElement.textContent = date.getDate()

		// Add classes based on date properties
		if (date.getMonth() !== currentMonth) {
			dateElement.classList.add('other-month')
		}

		if (this.isToday(date)) {
			dateElement.classList.add('today')
		}

		if (this.isSelected(date)) {
			if (this.isRangeStart(date)) {
				dateElement.classList.add('range-start')
			} else if (this.isRangeEnd(date)) {
				dateElement.classList.add('range-end')
			} else {
				dateElement.classList.add('in-range')
			}
		}

		// Add click event
		dateElement.addEventListener('click', () => {
			this.selectDate(date)
		})

		// Add hover effect for range selection
		dateElement.addEventListener('mouseenter', () => {
			if (this.isSelecting && this.selectedStart) {
				this.tempEnd = new Date(date)
				this.highlightTempRange()
			}
		})

		return dateElement
	}

	selectDate(date) {
		if (!this.isSelecting) {
			// Start new selection
			this.selectedStart = new Date(date)
			this.selectedEnd = null
			this.tempEnd = null
			this.isSelecting = true
		} else {
			// End selection
			if (date < this.selectedStart) {
				// If clicked date is before start, swap them
				this.selectedEnd = new Date(this.selectedStart)
				this.selectedStart = new Date(date)
			} else {
				this.selectedEnd = new Date(date)
			}
			this.isSelecting = false
		}

		this.renderCalendar()
	}

	highlightTempRange() {
		const dateElements = document.querySelectorAll('.calendar-date')

		dateElements.forEach(element => {
			element.classList.remove('in-range', 'range-start', 'range-end')

			const dateStr = element.textContent
			const elementDate = new Date(
				this.currentDate.getFullYear(),
				this.currentDate.getMonth(),
				parseInt(dateStr)
			)

			if (this.selectedStart && this.tempEnd) {
				const start =
					this.selectedStart < this.tempEnd ? this.selectedStart : this.tempEnd
				const end =
					this.selectedStart < this.tempEnd ? this.tempEnd : this.selectedStart

				if (
					elementDate >= start &&
					elementDate <= end &&
					!element.classList.contains('other-month')
				) {
					if (elementDate.getTime() === start.getTime()) {
						element.classList.add('range-start')
					} else if (elementDate.getTime() === end.getTime()) {
						element.classList.add('range-end')
					} else {
						element.classList.add('in-range')
					}
				}
			}
		})
	}

	isToday(date) {
		const today = new Date()
		return date.toDateString() === today.toDateString()
	}

	isSelected(date) {
		if (!this.selectedStart) return false

		if (!this.selectedEnd) {
			return date.getTime() === this.selectedStart.getTime()
		}

		const start =
			this.selectedStart < this.selectedEnd
				? this.selectedStart
				: this.selectedEnd
		const end =
			this.selectedStart < this.selectedEnd
				? this.selectedEnd
				: this.selectedStart

		return date >= start && date <= end
	}

	isRangeStart(date) {
		if (!this.selectedStart || !this.selectedEnd) return false
		const start =
			this.selectedStart < this.selectedEnd
				? this.selectedStart
				: this.selectedEnd
		return date.getTime() === start.getTime()
	}

	isRangeEnd(date) {
		if (!this.selectedStart || !this.selectedEnd) return false
		const end =
			this.selectedStart < this.selectedEnd
				? this.selectedEnd
				: this.selectedStart
		return date.getTime() === end.getTime()
	}

	formatDate(date) {
		const months = [
			'Янв',
			'Фев',
			'Мар',
			'Апр',
			'Май',
			'Июн',
			'Июл',
			'Авг',
			'Сен',
			'Окт',
			'Ноя',
			'Дек',
		]

		const day = String(date.getDate()).padStart(2, '0')
		const month = months[date.getMonth()]
		const year = date.getFullYear()

		return `${day} ${month}, ${year}`
	}

	updateSelectedRange() {
		const selectedDatesElement = document.getElementById('selectedDates')
		if (!selectedDatesElement) return

		if (this.selectedStart && this.selectedEnd) {
			const startFormatted = this.formatDate(this.selectedStart)
			const endFormatted = this.formatDate(this.selectedEnd)
			selectedDatesElement.textContent = `${startFormatted} - ${endFormatted}`
		} else if (this.selectedStart) {
			selectedDatesElement.textContent = this.formatDate(this.selectedStart)
		}
	}

	applySelection() {
		if (this.selectedStart && this.selectedEnd) {
			const dateRangeText = document.getElementById('dateRangeText')
			if (dateRangeText) {
				const startFormatted = this.formatDate(this.selectedStart)
				const endFormatted = this.formatDate(this.selectedEnd)

				dateRangeText.textContent = `${startFormatted} - ${endFormatted}`

				// Close calendar
				const calendarWrapper = document.getElementById('calendarWrapper')
				if (calendarWrapper) {
					calendarWrapper.classList.remove('show')
				}

				// You can add additional logic here to handle the selected date range
				console.log(
					'Selected date range:',
					this.selectedStart,
					'to',
					this.selectedEnd
				)
			}
		}
	}

	cancelSelection() {
		// Restore previous state
		this.selectedStart = this.previousStart
			? new Date(this.previousStart)
			: null
		this.selectedEnd = this.previousEnd ? new Date(this.previousEnd) : null
		this.tempEnd = null
		this.isSelecting = false

		// Re-render calendar with restored state
		this.renderCalendar()

		// Close calendar
		const calendarWrapper = document.getElementById('calendarWrapper')
		if (calendarWrapper) {
			calendarWrapper.classList.remove('show')
		}
	}

	saveCurrentState() {
		this.previousStart = this.selectedStart
			? new Date(this.selectedStart)
			: null
		this.previousEnd = this.selectedEnd ? new Date(this.selectedEnd) : null
	}
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new CustomCalendar()
	initCourseItemClickHandlers()
	initNavigationHandlers()
	initRedactorTabs()
	initMassageHandlers()
	initCoursesMenuButtons()
})

// Function to initialize redactor tabs
function initRedactorTabs() {
	const redactorTabs = document.querySelectorAll('.redactor__tab')

	if (redactorTabs.length === 0) {
		console.log('No redactor tabs found')
		return
	}

	console.log('Initializing redactor tabs:', redactorTabs.length)

	redactorTabs.forEach((tab, index) => {
		tab.addEventListener('click', function (e) {
			e.preventDefault()

			console.log('Tab clicked:', index, tab.textContent.trim())

			// Remove active class from all tabs
			redactorTabs.forEach(t => t.classList.remove('active'))

			// Add active class to clicked tab
			this.classList.add('active')

			// Here you can add logic to show/hide different content based on the tab
			const tabName = this.textContent.trim()
			console.log('Switching to tab:', tabName)

			// You can add specific logic for each tab here
			switch (tabName) {
				case 'Контент':
					showRedactorContent('content')
					break
				case 'Модули':
					showRedactorContent('modules')
					break
				case 'Меню':
					showRedactorContent('menu')
					break
				case 'Тарифы':
					showRedactorContent('tariffs')
					break
				case 'Настрйоки':
					showRedactorContent('settings')
					break
				default:
					showRedactorContent('content')
			}
		})
	})
}

// Function to show different redactor content based on selected tab
function showRedactorContent(contentType) {
	const redactorContent = document.querySelector('.redactor__content')

	if (!redactorContent) {
		console.log('Redactor content container not found')
		return
	}

	// You can implement different content for different tabs here
	console.log('Showing redactor content for:', contentType)

	// For now, we'll keep the existing content for all tabs
	// but you can add specific content for each tab type
}

// Function to initialize course item click handlers
function initCourseItemClickHandlers() {
	const courseItems = document.querySelectorAll('.courses__item')
	const redactor = document.querySelector('.redactor')
	const redactorTitle = document.querySelector('.redactor__title')
	const redactorBack = document.querySelector('.redactor__back')

	// Add click event to each course item
	courseItems.forEach(courseItem => {
		courseItem.addEventListener('click', function (e) {
			e.preventDefault()

			// Get course title from the clicked item
			const courseTitle = this.querySelector('.courses__title')
			const courseTitleText = courseTitle
				? courseTitle.textContent.trim()
				: 'Курс'

			// Update redactor title
			if (redactorTitle) {
				redactorTitle.textContent = courseTitleText
			}

			// Show redactor and hide other sections
			showRedactor()
		})
	})

	// Add click event to back button
	if (redactorBack) {
		redactorBack.addEventListener('click', function (e) {
			e.preventDefault()
			hideRedactor()
		})
	}
}

// Function to show redactor and hide other sections
function showRedactor() {
	const redactor = document.querySelector('.redactor')
	const infoItems = document.getElementById('infoItems')
	const chartSection = document.getElementById('chartSection')
	const coursesSection = document.querySelector('.courses')
	const manageSection = document.querySelector('.manage')
	const coursesSortContainer = document.getElementById('coursesSortContainer')

	// Hide all main sections
	if (infoItems) infoItems.style.display = 'none'
	if (chartSection) chartSection.style.display = 'none'
	if (coursesSection) coursesSection.style.display = 'none'
	if (manageSection) manageSection.style.display = 'none'
	if (coursesSortContainer) coursesSortContainer.style.display = 'none'

	// Show redactor
	if (redactor) {
		redactor.style.display = 'block'
	}
}

// Function to hide redactor and show courses instead of dashboard
function hideRedactor() {
	const redactor = document.querySelector('.redactor')
	const infoItems = document.getElementById('infoItems')
	const chartSection = document.getElementById('chartSection')
	const coursesSection = document.querySelector('.courses')
	const manageSection = document.querySelector('.manage')
	const coursesSortContainer = document.getElementById('coursesSortContainer')
	const manageInner = document.querySelector('.manage__inner')
	const manageCalendar = document.querySelector('.manage__calendar')
	const manageTrial = document.querySelector('.manage__trial')

	console.log('Hiding redactor and returning to courses...')

	// Hide redactor first
	if (redactor) {
		redactor.style.display = 'none'
		console.log('Redactor hidden')
	}

	// Hide dashboard sections (info and chart)
	if (infoItems) {
		infoItems.style.display = 'none'
		console.log('Info items hidden')
	}
	if (chartSection) {
		chartSection.style.display = 'none'
		console.log('Chart section hidden')
	}

	// Show manage section but hide calendar and trial period
	if (manageSection) {
		manageSection.style.display = 'block'
		console.log('Manage section shown')
	}
	if (manageCalendar) {
		manageCalendar.style.display = 'none'
		console.log('Manage calendar hidden')
	}
	if (manageTrial) {
		manageTrial.style.display = 'none'
		console.log('Manage trial hidden')
	}

	// Show courses and related elements
	if (coursesSection) {
		coursesSection.style.display = 'block'
		console.log('Courses section shown')
	}
	if (coursesSortContainer) {
		coursesSortContainer.style.display = 'block'
		console.log('Courses sort container shown')
	}
	if (manageInner) {
		manageInner.classList.add('courses-view')
		console.log('Added courses-view class to manage inner')
	}

	console.log('Returned to courses view successfully')
}

// Function to completely reset dashboard to initial state
function resetDashboardToInitialState() {
	console.log('Resetting dashboard to initial state...')

	// Get all main elements
	const redactor = document.querySelector('.redactor')
	const infoItems = document.getElementById('infoItems')
	const chartSection = document.getElementById('chartSection')
	const coursesSection = document.querySelector('.courses')
	const manageSection = document.querySelector('.manage')
	const coursesSortContainer = document.getElementById('coursesSortContainer')
	const manageInner = document.querySelector('.manage__inner')
	const manageCalendar = document.querySelector('.manage__calendar')
	const manageTrial = document.querySelector('.manage__trial')

	// Force hide redactor
	if (redactor) redactor.style.display = 'none'

	// Reset all display properties to initial state
	if (infoItems) {
		infoItems.style.display = ''
		infoItems.style.removeProperty('display')
		infoItems.style.display = 'flex'
	}

	if (chartSection) {
		chartSection.style.display = ''
		chartSection.style.removeProperty('display')
		chartSection.style.display = 'block'
	}

	if (manageSection) {
		manageSection.style.display = ''
		manageSection.style.removeProperty('display')
		manageSection.style.display = 'block'
	}

	if (manageCalendar) {
		manageCalendar.style.display = ''
		manageCalendar.style.removeProperty('display')
		manageCalendar.style.display = 'flex'
	}

	if (manageTrial) {
		manageTrial.style.display = ''
		manageTrial.style.removeProperty('display')
		manageTrial.style.display = 'flex'
	}

	// Hide courses related elements
	if (coursesSection) coursesSection.style.display = 'none'
	if (coursesSortContainer) coursesSortContainer.style.display = 'none'

	// Remove any added classes
	if (manageInner) {
		manageInner.classList.remove('courses-view')
		manageInner.className = manageInner.className.replace(/\s+/g, ' ').trim()
	}

	console.log('Dashboard reset complete')
}

// Function to check if redactor is currently open
function isRedactorOpen() {
	const redactor = document.querySelector('.redactor')
	return redactor && redactor.style.display === 'block'
}

// Function to check if massage is currently open
function isMassageOpen() {
	const massage = document.querySelector('.massage')
	return massage && massage.style.display === 'block'
}

// Function to handle dashboard navigation
function handleDashboardNavigation(e) {
	e.preventDefault()

	// If massage is open, close it and return to dashboard
	if (isMassageOpen()) {
		console.log('Closing massage and returning to dashboard')
		hideMassageBlockToDashboard()
		return
	}

	// If redactor is open, close it and return to dashboard without saving
	if (isRedactorOpen()) {
		hideRedactor()
		return
	}

	// Otherwise, show dashboard normally
	showDashboardView()
}

// Function to handle create content button click
function handleCreateContentClick(e) {
	e.preventDefault()

	// Check if click came from redactor button (but NOT from redactor__create or redactor__add)
	const isFromRedactor =
		e.target.id === 'createContentBtnTariff' ||
		e.target.closest('#createContentBtnTariff')

	// Check if this is a redactor__create or redactor__add button (these should show massage block instead)
	const isRedactorCreateOrAdd =
		e.target.classList.contains('redactor__create') ||
		e.target.closest('.redactor__create') ||
		e.target.classList.contains('redactor__add') ||
		e.target.closest('.redactor__add')

	// If this is a redactor__create or redactor__add button, let the massage handlers deal with it
	if (isRedactorCreateOrAdd) {
		console.log(
			'Redactor create/add button clicked - letting massage handler deal with it'
		)
		return
	}

	// If click is from redactor button, always show modal (don't close redactor)
	if (isFromRedactor) {
		console.log('Create content clicked from redactor - showing modal')
		// Show the modal directly without closing redactor
		if (typeof showCreateProductModal === 'function') {
			showCreateProductModal()
		}
		return
	}

	// If redactor is open and click is NOT from redactor button, close it and return to dashboard
	if (isRedactorOpen()) {
		console.log('Create content clicked while redactor open - closing redactor')
		hideRedactor()
		return
	}

	// Otherwise, proceed with normal create content flow - directly call the modal function
	// First ensure we're on dashboard view
	showDashboardView()

	// Then show the modal (this function is defined in the HTML script)
	if (typeof showCreateProductModal === 'function') {
		showCreateProductModal()
	} else {
		// Fallback: try to trigger the modal by simulating click on original button
		const originalBtn = document.getElementById('createContentBtn')
		if (originalBtn && originalBtn.click) {
			// Create a new event to trigger the original handler
			const clickEvent = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window,
			})
			originalBtn.dispatchEvent(clickEvent)
		}
	}
}

// Function to show dashboard view (helper function)
function showDashboardView() {
	const infoItems = document.getElementById('infoItems')
	const chartSection = document.getElementById('chartSection')
	const coursesSection = document.querySelector('.courses')
	const manageSection = document.querySelector('.manage')
	const coursesSortContainer = document.getElementById('coursesSortContainer')
	const manageInner = document.querySelector('.manage__inner')
	const manageCalendar = document.querySelector('.manage__calendar')
	const manageTrial = document.querySelector('.manage__trial')

	// Show dashboard elements
	if (infoItems) infoItems.style.display = 'flex'
	if (chartSection) chartSection.style.display = 'block'
	if (manageSection) manageSection.style.display = 'block'
	if (manageCalendar) manageCalendar.style.display = 'flex'
	if (manageTrial) manageTrial.style.display = 'flex'

	// Hide courses elements
	if (coursesSection) coursesSection.style.display = 'none'
	if (coursesSortContainer) coursesSortContainer.style.display = 'none'

	// Remove any added classes
	if (manageInner) {
		manageInner.classList.remove('courses-view')
		manageInner.className = manageInner.className.replace(/\s+/g, ' ').trim()
	}
}

// Initialize navigation handlers
function initNavigationHandlers() {
	// Handle dashboard link clicks
	const dashboardLinks = document.querySelectorAll('a[href="#dashboard"]')
	dashboardLinks.forEach(link => {
		link.addEventListener('click', handleDashboardNavigation)
	})

	// Handle logo clicks (should also return to dashboard)
	const logoLink = document.querySelector('.logo')
	if (logoLink) {
		logoLink.addEventListener('click', handleDashboardNavigation)
	}

	// Handle create content button clicks
	const createContentBtn = document.getElementById('createContentBtn')
	if (createContentBtn) {
		// Simply add a new listener without removing existing ones
		createContentBtn.addEventListener('click', handleCreateContentClick)
	}

	// Also handle the create content button in redactor
	const createContentBtnRedactor = document.getElementById(
		'createContentBtnTariff'
	)
	if (createContentBtnRedactor) {
		createContentBtnRedactor.addEventListener('click', handleCreateContentClick)
	}
}

// Function to show massage block
function showMassageBlock() {
	console.log('Showing massage block')

	const massage = document.querySelector('.massage')
	const redactor = document.querySelector('.redactor')
	const infoItems = document.getElementById('infoItems')
	const chartSection = document.getElementById('chartSection')
	const coursesSection = document.querySelector('.courses')
	const manageSection = document.querySelector('.manage')
	const coursesSortContainer = document.getElementById('coursesSortContainer')

	// Hide all other sections
	if (redactor) redactor.style.display = 'none'
	if (infoItems) infoItems.style.display = 'none'
	if (chartSection) chartSection.style.display = 'none'
	if (coursesSection) coursesSection.style.display = 'none'
	if (manageSection) manageSection.style.display = 'none'
	if (coursesSortContainer) coursesSortContainer.style.display = 'none'

	// Show massage block
	if (massage) {
		massage.style.display = 'block'
		console.log('Massage block shown')
	}
}

// Function to hide massage block and return to redactor
function hideMassageBlock() {
	console.log('Hiding massage block')

	const massage = document.querySelector('.massage')
	const redactor = document.querySelector('.redactor')

	// Hide massage block
	if (massage) {
		massage.style.display = 'none'
		console.log('Massage block hidden')
	}

	// Show redactor again
	if (redactor) {
		redactor.style.display = 'block'
		console.log('Redactor shown')
	}
}

// Function to hide massage block and return to dashboard
function hideMassageBlockToDashboard() {
	console.log('Hiding massage block and returning to dashboard')

	const massage = document.querySelector('.massage')
	const redactor = document.querySelector('.redactor')
	const infoItems = document.getElementById('infoItems')
	const chartSection = document.getElementById('chartSection')
	const coursesSection = document.querySelector('.courses')
	const manageSection = document.querySelector('.manage')
	const coursesSortContainer = document.getElementById('coursesSortContainer')
	const manageInner = document.querySelector('.manage__inner')
	const manageCalendar = document.querySelector('.manage__calendar')
	const manageTrial = document.querySelector('.manage__trial')

	// Hide massage block
	if (massage) {
		massage.style.display = 'none'
		console.log('Massage block hidden')
	}

	// Hide redactor as well
	if (redactor) {
		redactor.style.display = 'none'
		console.log('Redactor hidden')
	}

	// Show dashboard elements
	if (infoItems) infoItems.style.display = 'flex'
	if (chartSection) chartSection.style.display = 'block'
	if (manageSection) manageSection.style.display = 'block'
	if (manageCalendar) manageCalendar.style.display = 'flex'
	if (manageTrial) manageTrial.style.display = 'flex'

	// Hide courses elements
	if (coursesSection) coursesSection.style.display = 'none'
	if (coursesSortContainer) coursesSortContainer.style.display = 'none'

	// Remove any added classes
	if (manageInner) {
		manageInner.classList.remove('courses-view')
		manageInner.className = manageInner.className.replace(/\s+/g, ' ').trim()
	}

	console.log('Returned to dashboard from massage')
}

// Function to initialize massage block handlers
function initMassageHandlers() {
	console.log('Initializing massage handlers')

	// Handle redactor__create button clicks
	const redactorCreateBtns = document.querySelectorAll('.redactor__create')
	redactorCreateBtns.forEach(btn => {
		btn.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()
			console.log('Redactor create button clicked')
			showMassageBlock()
		})
	})

	// Handle redactor__add button clicks
	const redactorAddBtns = document.querySelectorAll('.redactor__add')
	redactorAddBtns.forEach(btn => {
		btn.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()
			console.log('Redactor add button clicked')
			showMassageBlock()
		})
	})

	// Handle massage back button
	const massageBackBtn = document.querySelector('.massage__back')
	if (massageBackBtn) {
		massageBackBtn.addEventListener('click', function (e) {
			e.preventDefault()
			console.log('Massage back button clicked')
			hideMassageBlock()
		})
	}

	// Initialize text formatting buttons
	initTextFormattingButtons()
}

// Function to initialize text formatting buttons in massage__correct
function initTextFormattingButtons() {
	console.log('Initializing text formatting buttons')

	const massageCorrect = document.querySelector('.massage__correct')
	const massageTextarea = document.querySelector('.massage__textarea')

	if (!massageCorrect || !massageTextarea) {
		console.log('Text formatting elements not found')
		return
	}

	// Get all SVG buttons in massage__correct
	const formatButtons = massageCorrect.querySelectorAll('svg')

	if (formatButtons.length === 0) {
		console.log('No formatting buttons found')
		return
	}

	// Add click handlers for each formatting button
	formatButtons.forEach((button, index) => {
		button.style.cursor = 'pointer'
		button.style.transition = 'opacity 0.2s ease'

		// Add hover effect
		button.addEventListener('mouseenter', () => {
			button.style.opacity = '0.7'
		})

		button.addEventListener('mouseleave', () => {
			button.style.opacity = '1'
		})

		button.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()

			let formatType = ''
			switch (index) {
				case 0: // Bold
					formatType = 'bold'
					break
				case 1: // Italic
					formatType = 'italic'
					break
				case 2: // Underline
					formatType = 'underline'
					break
			}

			if (formatType) {
				applyTextFormatting(massageTextarea, formatType)
			}
		})
	})
}

// Function to apply text formatting to textarea
function applyTextFormatting(textarea, formatType) {
	console.log(`Applying ${formatType} formatting`)

	const start = textarea.selectionStart
	const end = textarea.selectionEnd
	const selectedText = textarea.value.substring(start, end)

	let formattedText = ''
	let wrapStart = ''
	let wrapEnd = ''

	// Define formatting tags
	switch (formatType) {
		case 'bold':
			wrapStart = '**'
			wrapEnd = '**'
			break
		case 'italic':
			wrapStart = '*'
			wrapEnd = '*'
			break
		case 'underline':
			wrapStart = '<u>'
			wrapEnd = '</u>'
			break
	}

	// Check if text is already formatted
	const beforeSelection = textarea.value.substring(
		Math.max(0, start - wrapStart.length),
		start
	)
	const afterSelection = textarea.value.substring(end, end + wrapEnd.length)

	if (beforeSelection === wrapStart && afterSelection === wrapEnd) {
		// Remove formatting
		const newValue =
			textarea.value.substring(0, start - wrapStart.length) +
			selectedText +
			textarea.value.substring(end + wrapEnd.length)

		textarea.value = newValue
		textarea.focus()
		textarea.setSelectionRange(start - wrapStart.length, end - wrapStart.length)

		console.log(`Removed ${formatType} formatting`)
	} else {
		// Add formatting
		if (selectedText) {
			// Wrap selected text
			formattedText = wrapStart + selectedText + wrapEnd
		} else {
			// Insert placeholder with formatting
			formattedText = wrapStart + 'текст' + wrapEnd
		}

		const newValue =
			textarea.value.substring(0, start) +
			formattedText +
			textarea.value.substring(end)

		textarea.value = newValue
		textarea.focus()

		if (selectedText) {
			// Select the formatted text
			textarea.setSelectionRange(start, start + formattedText.length)
		} else {
			// Select the placeholder text
			textarea.setSelectionRange(
				start + wrapStart.length,
				start + wrapStart.length + 5
			) // "текст".length = 5
		}

		console.log(`Applied ${formatType} formatting`)
	}

	// Trigger input event to notify of changes
	const inputEvent = new Event('input', { bubbles: true })
	textarea.dispatchEvent(inputEvent)
}

// Function to initialize courses menu buttons
function initCoursesMenuButtons() {
	console.log('Initializing courses menu buttons...')

	// Get all courses buttons
	const coursesButtons = document.querySelectorAll('.courses__btn')

	console.log('Found', coursesButtons.length, 'courses buttons')

	coursesButtons.forEach((button, index) => {
		// Find the corresponding menu-add element and button container for this button
		const courseItem = button.closest('.courses__item')
		const buttonContainer = button.closest('.courses__btn-container')
		const menuAdd = courseItem ? courseItem.querySelector('.menu-add') : null

		if (menuAdd && buttonContainer) {
			console.log('Setting up button', index, 'with menu')

			// Add click event listener
			button.addEventListener('click', function (e) {
				e.preventDefault()
				e.stopPropagation()

				console.log('Courses button', index, 'clicked')

				// Close all other menus first
				const allButtonContainers = document.querySelectorAll(
					'.courses__btn-container'
				)
				allButtonContainers.forEach(container => {
					if (container !== buttonContainer) {
						container.classList.remove('menu-open')
					}
				})

				// Toggle the current menu
				buttonContainer.classList.toggle('menu-open')

				// Log the state
				console.log(
					'Menu is now',
					buttonContainer.classList.contains('menu-open') ? 'visible' : 'hidden'
				)
			})
		} else {
			console.log('No menu or container found for button', index)
		}
	})

	// Close menus when clicking outside
	document.addEventListener('click', function (e) {
		// Check if the click is outside all course items
		if (!e.target.closest('.courses__item')) {
			const allButtonContainers = document.querySelectorAll(
				'.courses__btn-container'
			)
			allButtonContainers.forEach(container => {
				container.classList.remove('menu-open')
			})
		}
	})

	console.log('Courses menu buttons initialization complete')
}

// Function to initialize menu-add click functionality
function initMenuAddClick() {
	console.log('Initializing menu-add click functionality')

	// Get all course items with menu buttons
	const courseItems = document.querySelectorAll('.courses__item')

	courseItems.forEach((courseItem, index) => {
		const btnContainer = courseItem.querySelector('.courses__btn-container')
		const menuBtn = courseItem.querySelector('.courses__btn')
		const menuAdd = courseItem.querySelector('.menu-add')

		if (btnContainer && menuBtn && menuAdd) {
			// Add click event to menu button
			menuBtn.addEventListener('click', function (e) {
				e.preventDefault()
				e.stopPropagation()

				console.log(`Menu button ${index} clicked`)

				// Close all other open menus first
				document
					.querySelectorAll('.courses__btn-container.menu-open')
					.forEach(container => {
						if (container !== btnContainer) {
							container.classList.remove('menu-open')
						}
					})

				// Toggle current menu
				btnContainer.classList.toggle('menu-open')

				// Log current state
				if (btnContainer.classList.contains('menu-open')) {
					console.log(`Menu ${index} opened`)
				} else {
					console.log(`Menu ${index} closed`)
				}
			})

			// Prevent course item click when clicking on menu button
			btnContainer.addEventListener('click', function (e) {
				e.stopPropagation()
			})
		}
	})

	// Close menus when clicking outside
	document.addEventListener('click', function (e) {
		// Check if click is outside all menu containers
		if (!e.target.closest('.courses__btn-container')) {
			document
				.querySelectorAll('.courses__btn-container.menu-open')
				.forEach(container => {
					container.classList.remove('menu-open')
				})
		}
	})

	console.log('Menu-add click functionality initialized')
}
