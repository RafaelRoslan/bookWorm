import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardBookComponent } from "../../components/card-book/card-book.component";

@Component({
  selector: 'app-collection',
  imports: [CardBookComponent, NgFor, NgIf, FormsModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css'
})
export class CollectionComponent {
  collection = {
    name: 'Coleção Shonen'
  };

  books = [
    {
      titulo: 'One Piece Vol. 1',
      ano: '1997',
      autor: 'Eiichiro Oda',
      status: 'Lido',
      imageUrl: ''
    },
    {
      titulo: 'Naruto Vol. 1',
      ano: '1999',
      autor: 'Masashi Kishimoto',
      status: 'Não Lido',
      imageUrl: ''
    },
    {
      titulo: 'One Piece Vol. 1',
      ano: '1997',
      autor: 'Eiichiro Oda',
      status: 'Lido',
      imageUrl: ''
    },
    {
      titulo: 'Naruto Vol. 1',
      ano: '1999',
      autor: 'Masashi Kishimoto',
      status: 'Não Lido',
      imageUrl: ''
    },
    {
      titulo: 'One Piece Vol. 1',
      ano: '1997',
      autor: 'Eiichiro Oda',
      status: 'Lido',
      imageUrl: ''
    },
    {
      titulo: 'Naruto Vol. 1',
      ano: '1999',
      autor: 'Masashi Kishimoto',
      status: 'Não Lido',
      imageUrl: ''
    },
    {
      titulo: 'One Piece Vol. 1',
      ano: '1997',
      autor: 'Eiichiro Oda',
      status: 'Lido',
      imageUrl: ''
    },
    {
      titulo: 'Naruto Vol. 1',
      ano: '1999',
      autor: 'Masashi Kishimoto',
      status: 'Não Lido',
      imageUrl: ''
    },
  ];


  editMode: boolean = false;

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  removeBook(index: number): void {
    if (confirm('Deseja realmente remover este livro da coleção?')) {
      this.books.splice(index, 1);
    }
  }

}
