import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  name = '';
  email = '';
  message = '';
  honeypot = '';

  isSending = signal<boolean>(false);
  formStatus = signal<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  toastMessage = signal<string>('');

  private lastSentTime = 0;
  private readonly EMAILJS_CONFIG = {
    serviceId: 'service_j79fre3',
    templateId: 'template_sl4h8y7',
    publicKey: '7h2wgg4kQPqH3Dofc'
  };

  async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast(`Copied ${text}`);
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      this.showToast(`Copied ${text}`);
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 2200);
  }

  async onSubmit(): Promise<void> {
    if (this.honeypot) return; // bot detection

    const name = this.name.trim();
    const email = this.email.trim();
    const message = this.message.trim();

    if (!name) {
      this.formStatus.set({ message: 'Please enter your name.', type: 'error' });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      this.formStatus.set({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (message.length < 8) {
      this.formStatus.set({ message: 'Message should be at least 8 characters.', type: 'error' });
      return;
    }

    if (Date.now() - this.lastSentTime < 12000) {
      this.formStatus.set({ message: 'Please wait a moment before sending again.', type: 'error' });
      return;
    }

    this.isSending.set(true);
    this.formStatus.set({ message: '', type: '' });

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: this.EMAILJS_CONFIG.serviceId,
          template_id: this.EMAILJS_CONFIG.templateId,
          user_id: this.EMAILJS_CONFIG.publicKey,
          template_params: {
            name,
            email,
            message,
            reply_to: email,
            time: new Date().toLocaleString()
          }
        })
      });

      if (response.ok) {
        this.lastSentTime = Date.now();
        this.name = '';
        this.email = '';
        this.message = '';
        this.formStatus.set({
          message: 'Thank you! Message sent successfully. I will get back to you shortly.',
          type: 'success'
        });
        this.showToast('Message sent successfully!');
      } else {
        const errText = await response.text();
        throw new Error(errText || 'Failed to send');
      }
    } catch (err: unknown) {
      console.error('Email send error:', err);
      this.formStatus.set({
        message: 'Could not send directly. Please copy my email and contact me directly.',
        type: 'error'
      });
    } finally {
      this.isSending.set(false);
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
