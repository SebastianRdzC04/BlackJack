import { Component } from '@angular/core';
import { AuthServices } from '../../services/auth-services';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesServices } from '../../services/games-services';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-index',
  imports: [CommonModule, FormsModule],
  templateUrl: './index.html',
  styleUrl: './index.css'
})
export class Index {
  private authService = inject(AuthServices);
  private gameService = inject(GamesServices);
  private router = inject(Router);

  joinCode = new FormControl('');

  showSeguroModal = false;
  seguro: boolean = false;

  showUnirseModal = false;
  codigoPartida: string = '';

  logout() {
    this.authService.logout();
  }

  openSeguroModal() {
    this.showSeguroModal = true;
  }

  closeSeguroModal() {
    this.showSeguroModal = false;
  }

  confirmarSeguro() {
    // Aquí puedes manejar la lógica para iniciar la partida con el seguro seleccionado
    // Por ejemplo: this.partidaService.iniciarPartida({ seguro: this.seguro });
    this.gameService.createGame().subscribe({
      next: (response) => {
        console.log('Partida creada:', response);
        console.log('ID de la partida:', response.data.game._id);
        localStorage.setItem('gameId', response.data.game._id);

      }, error: (error) => {
        console.error('Error al crear la partida:', error);
      }
    });

    this.router.navigate(['/game']);

    this.closeSeguroModal();
  }

  openUnirseModal() {
    this.showUnirseModal = true;
  }

  closeUnirseModal() {
    this.showUnirseModal = false;
    this.codigoPartida = '';
  }

  confirmarUnirse() {
    
    this.gameService.joinGame(this.codigoPartida).subscribe({
      next: (response) => {
        console.log('Unido a la partida:', response);
        localStorage.setItem('gameId', response.data.game._id);
        this.router.navigate(['/game']);
      }, error: (error) => {
        console.error('Error al unirse a la partida:', error);
        // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje al usuario
      }
    })
    this.closeUnirseModal();
  }
}
