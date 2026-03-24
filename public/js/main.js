// Funções para o painel do barbeiro
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && closeMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('-translate-x-full');
        });
        
        closeMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('-translate-x-full');
        });
    }
    
    // Current date
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        currentDateElement.textContent = today.toLocaleDateString('pt-BR', options);
    }
    
    // Calendar day selection
    const calendarDays = document.querySelectorAll('.calendar-day:not(.disabled)');
    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            // Remove selected class from all days
            calendarDays.forEach(d => d.classList.remove('selected'));
            // Add selected class to clicked day
            day.classList.add('selected');
            
            // Update available time slots header
            const timeSlotHeader = document.querySelector('h5.text-md.font-medium.text-gray-900.mb-3');
            if (timeSlotHeader) {
                timeSlotHeader.textContent = `Horários Disponíveis - ${day.textContent} de Maio`;
            }
        });
    });
    
    // Time slot selection
    const timeSlots = document.querySelectorAll('.time-slot:not(.booked)');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            // Toggle selected class
            slot.classList.toggle('selected');
            if (slot.classList.contains('selected')) {
                slot.classList.add('bg-blue-600', 'text-white');
            } else {
                slot.classList.remove('bg-blue-600', 'text-white');
            }
        });
    });
    
    // Show notification function
    window.showNotification = function(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            const messageElement = notification.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        }
    }
    
    // Appointment modal
    const appointmentModal = document.getElementById('appointment-modal');
    
    // Function to open appointment modal
    window.openAppointmentModal = function() {
        if (appointmentModal) {
            appointmentModal.classList.remove('hidden');
        }
    }
    
    // Close appointment modal
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn && appointmentModal) {
        closeModalBtn.addEventListener('click', () => {
            appointmentModal.classList.add('hidden');
        });
    }
    
    const cancelAppointmentBtn = document.getElementById('cancel-appointment');
    if (cancelAppointmentBtn && appointmentModal) {
        cancelAppointmentBtn.addEventListener('click', () => {
            appointmentModal.classList.add('hidden');
        });
    }
    
    // Handle new client selection
    const clientSelect = document.querySelector('#appointment-form select');
    const newClientFields = document.getElementById('new-client-fields');
    
    if (clientSelect && newClientFields) {
        clientSelect.addEventListener('change', () => {
            if (clientSelect.value === '4') {
                newClientFields.classList.remove('hidden');
            } else {
                newClientFields.classList.add('hidden');
            }
        });
    }
    
    // Appointment form submission
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm && appointmentModal) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            appointmentModal.classList.add('hidden');
            window.showNotification('Agendamento realizado com sucesso!');
        });
    }
    
    // Payment modal
    const paymentModal = document.getElementById('payment-modal');
    
    // Function to open payment modal
    window.openPaymentModal = function() {
        if (paymentModal) {
            paymentModal.classList.remove('hidden');
        }
    }
    
    // Close payment modal
    const closePaymentModalBtn = document.getElementById('close-payment-modal');
    if (closePaymentModalBtn && paymentModal) {
        closePaymentModalBtn.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
        });
    }
    
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    if (cancelPaymentBtn && paymentModal) {
        cancelPaymentBtn.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
        });
    }
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    const pixPayment = document.getElementById('pix-payment');
    
    if (paymentMethods.length > 0 && pixPayment) {
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                // Remove selected class from all methods
                paymentMethods.forEach(m => {
                    m.classList.remove('border-blue-500', 'bg-blue-50');
                });
                
                // Add selected class to clicked method
                method.classList.add('border-blue-500', 'bg-blue-50');
                
                // Show PIX payment details if PIX is selected
                if (method.querySelector('p').textContent === 'Pix') {
                    pixPayment.classList.remove('hidden');
                } else {
                    pixPayment.classList.add('hidden');
                }
            });
        });
    }
    
    // Confirm payment
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    if (confirmPaymentBtn && paymentModal) {
        confirmPaymentBtn.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            window.showNotification('Pagamento confirmado com sucesso!');
        });
    }
    
    // Client modal
    const clientModal = document.getElementById('client-modal');
    
    // Function to open client modal
    window.openClientModal = function() {
        if (clientModal) {
            clientModal.classList.remove('hidden');
        }
    }
    
    // Close client modal
    const closeClientModalBtn = document.getElementById('close-client-modal');
    if (closeClientModalBtn && clientModal) {
        closeClientModalBtn.addEventListener('click', () => {
            clientModal.classList.add('hidden');
        });
    }
    
    // Add event listeners to client names in the table
    const clientNames = document.querySelectorAll('td .text-sm.font-medium.text-gray-900');
    if (clientNames.length > 0) {
        clientNames.forEach(name => {
            name.addEventListener('click', () => {
                window.openClientModal();
            });
        });
    }
    
    // Add floating action button for new appointment
    const fab = document.createElement('button');
    fab.className = 'fab fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-30 hover:bg-blue-700';
    fab.innerHTML = '<i class="fas fa-plus text-xl"></i>';
    fab.addEventListener('click', window.openAppointmentModal);
    document.body.appendChild(fab);
    
    // Add event listeners to action buttons in the table
    const confirmButtons = document.querySelectorAll('td .text-blue-600');
    if (confirmButtons.length > 0) {
        confirmButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.openPaymentModal();
            });
        });
    }
    
    const cancelButtons = document.querySelectorAll('td .text-red-600');
    if (cancelButtons.length > 0) {
        cancelButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.showNotification('Agendamento cancelado com sucesso!');
            });
        });
    }
    
    // Copiar código PIX
    const pixCodeElement = document.querySelector('.pix-code');
    const copyButton = document.querySelector('.pix-code + button');
    
    if (pixCodeElement && copyButton) {
        copyButton.addEventListener('click', () => {
            const pixCode = pixCodeElement.textContent.trim();
            navigator.clipboard.writeText(pixCode)
                .then(() => {
                    window.showNotification('Código PIX copiado para a área de transferência!');
                })
                .catch(err => {
                    console.error('Erro ao copiar: ', err);
                });
        });
    }
});
