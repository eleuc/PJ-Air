import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class DevtoolsService {
  constructor(private productsService: ProductsService) {}

  async seedProducts() {
    const products = [
      // Croissants
      { id: 1, name: 'Cookie Croissant', category: 'Croissants', price: 4.95, description: 'Cookie Croissant', image: '/images/products/Cookie Croissant.jpg' },
      { id: 2, name: 'Pain au Chocolat', category: 'Croissants', price: 3.25, description: 'Pain au Chocolat', image: '/images/products/Pain au Chocolat.jpg' },
      { id: 3, name: 'Nutella New York Roll', category: 'Croissants', price: 4.50, description: 'Nutella New York Roll', image: '/images/products/Nutella New York Roll.jpg' },
      { id: 4, name: 'Fruit Danish', category: 'Croissants', price: 7.95, description: 'Fruit Danish', image: '/images/products/Fruit Danish.jpg' },
      { id: 5, name: 'Raspberry Cream Cheese', category: 'Croissants', price: 4.95, description: 'Raspberry Cream Cheese', image: '/images/products/Raspberry Cream Cheese.jpg' },
      { id: 6, name: 'Chocolate Mousse Croissant', category: 'Croissants', price: 4.95, description: 'Chocolate Mousse Croissant', image: '/images/products/Chocolate Mousse.jpg' },
      { id: 7, name: 'Lemon Pie Croissant', category: 'Croissants', price: 4.95, description: 'Lemon Pie Croissant', image: '/images/products/Lemon Pie Croissant.jpg' },
      { id: 8, name: 'Almond Croissant', category: 'Croissants', price: 3.50, description: 'Almond Croissant', image: '/images/products/Almond Croissant.jpg' },
      { id: 9, name: 'Pistachio & Raspberry', category: 'Croissants', price: 4.95, description: 'Pistachio & Raspberry', image: '/images/products/Pistachio & Raspberry.jpg' },
      { id: 10, name: 'Dulce de Leche', category: 'Croissants', price: 4.95, description: 'Dulce de Leche', image: '/images/products/Dulce de Leche.jpg' },
      { id: 11, name: 'Strawberry Croissant', category: 'Croissants', price: 4.95, description: 'Strawberry Croissant', image: '/images/products/Strawberry Croissant.jpg' },
      { id: 12, name: 'Dubai Chocolate', category: 'Croissants', price: 4.95, description: 'Dubai Chocolate', image: '/images/products/Dubai Chocolate.jpg' },
      { id: 13, name: 'Artisanal Croissant', category: 'Croissants', price: 2.50, description: 'Artisanal Croissant', image: '/images/products/Artisanal Croissant.jpg' },
      
      // Postres (Desserts)
      { id: 14, name: 'Emerald Temptation', category: 'Postres', price: 6.50, description: 'Pistachio mousse', image: '/images/products/Emerald Temptation.jpg' },
      { id: 15, name: 'Zesty Lemon', category: 'Postres', price: 6.50, description: 'Lemon mousse', image: '/images/products/Zesty Lemon.jpg' },
      { id: 16, name: 'Classic Tres Leches', category: 'Postres', price: 4.50, description: 'Moist sponge cake', image: '/images/products/Classic Tres Leches.jpg' },
      { id: 17, name: 'Apple Essence', category: 'Postres', price: 6.50, description: 'Apple mousse', image: '/images/products/Apple Essence.jpg' },
      { id: 18, name: 'Berry Cloud Pavlova', category: 'Postres', price: 6.50, description: 'Milk powder mousse', image: '/images/products/Berry Cloud Pavlova.jpg' },
      { id: 19, name: 'Tiramisú', category: 'Postres', price: 6.50, description: 'Classic Italian dessert', image: '/images/products/Tiramisú.jpg' },
      { id: 20, name: 'Creamy Dulce Temptation', category: 'Postres', price: 6.50, description: 'Cream cheese mousse', image: '/images/products/Creamy Dulce Temptation.jpg' },
      { id: 21, name: 'Triple Chocolate Mousse', category: 'Postres', price: 6.50, description: 'Triple chocolate', image: '/images/products/Triple Chocolate.jpg' },
      { id: 22, name: 'Tropical Bliss', category: 'Postres', price: 6.50, description: 'Passion fruit mousse', image: '/images/products/Tropical Bliss.jpg' },
      { id: 23, name: 'Pear Harmony', category: 'Postres', price: 6.50, description: 'White chocolate mousse', image: '/images/products/Pear Harmony.jpg' },
      { id: 24, name: 'Crème Brûlée', category: 'Postres', price: 4.50, description: 'Classic French dessert', image: '/images/products/Crème Brûlée.jpg' },
      { id: 25, name: 'Blueberry Heart', category: 'Postres', price: 6.50, description: 'Greek yogurt mousse', image: '/images/products/Blueberry Heart.jpg' },
      { id: 26, name: 'Napoleon', category: 'Postres', price: 6.50, description: 'Butter puff pastry', image: '/images/products/Napoleon.jpg' },
      { id: 27, name: 'Dark Passion', category: 'Postres', price: 6.50, description: '70% cocoa mousse', image: '/images/products/Dark Passion.jpg' },
      { id: 28, name: 'Golden Crunch', category: 'Postres', price: 6.50, description: 'Milk chocolate mousse', image: '/images/products/Golden Crunch.jpg' },
      { id: 29, name: 'Golden Love', category: 'Postres', price: 6.50, description: 'Passion fruit mousse', image: '/images/products/Golden Love.jpg' },
      { id: 30, name: 'Caramel Banana Bliss', category: 'Postres', price: 6.50, description: 'Banana mousse', image: '/images/products/Caramel Banana Bliss.jpg' },
      { id: 31, name: 'Fruit Tart', category: 'Postres', price: 7.00, description: 'Butter sablé tart', image: '/images/products/Fruit Tart.jpg' },
      { id: 32, name: 'Mango Coco Dream', category: 'Postres', price: 6.50, description: 'Tropical mango', image: '/images/products/Mango Coco Dream.jpg' },
      { id: 33, name: 'Orange Blossom Delight', category: 'Postres', price: 6.50, description: 'Orange mousse', image: '/images/products/Orange Blossom Delight.jpg' },
      { id: 34, name: 'Rosa Elegance', category: 'Postres', price: 6.50, description: 'Mascarpone mousse', image: '/images/products/Rosa Elegance.jpg' },
      { id: 35, name: 'Raspberry Secret', category: 'Postres', price: 6.50, description: 'Milk mousse', image: '/images/products/Raspberry Secret.jpg' },
      { id: 36, name: 'Piña Colada Dream', category: 'Postres', price: 6.50, description: 'Piña colada mousse', image: '/images/products/Piña Colada Dream.jpg' },
      { id: 37, name: 'Mango Tres Leches', category: 'Postres', price: 6.50, description: 'Mango mousse', image: '/images/products/Mango Tres Leches.jpg' },
      { id: 38, name: 'Strawberry Bliss', category: 'Postres', price: 6.50, description: 'Milk mousse', image: '/images/products/Strawberry Bliss.jpg' },

      // Pasteles (Cakes Slices)
      { id: 39, name: 'Mocca Chocolate Mousse', category: 'Pasteles', price: 4.90, description: 'Mocha mousse', image: '/images/products/slices/Mocca Chocolate.jpg' },
      { id: 40, name: 'Carrot Cake', category: 'Pasteles', price: 4.90, description: 'Moist carrot cake', image: '/images/products/slices/carrot_p.jpg' },
      { id: 41, name: 'Black Forest', category: 'Pasteles', price: 4.90, description: 'Chocolate sponge layered', image: '/images/products/slices/BlackForest_p.jpg' },
      { id: 42, name: 'White Chocolate Mousse', category: 'Pasteles', price: 4.90, description: 'Velvety white chocolate', image: '/images/products/slices/White Chocolat.jpg' },
      { id: 43, name: 'Red Velvet', category: 'Pasteles', price: 4.90, description: 'Classic Red Velvet', image: '/images/products/slices/red_velvet_p.jpg' },
      { id: 44, name: 'New York Cheesecake', category: 'Pasteles', price: 4.90, description: 'Classic New York-style', image: '/images/products/slices/NewYork_p.jpg' },
      { id: 45, name: 'Mango Cheesecake', category: 'Pasteles', price: 4.90, description: 'Tropical mango layer', image: '/images/products/slices/Mango Cheesecake.jpg' },
      { id: 46, name: 'Tiramisu Slice', category: 'Pasteles', price: 4.90, description: 'Classic Italian dessert', image: '/images/products/slices/Tiramisu.jpg' },
      { id: 47, name: 'Dulce de Leche Cheesecake', category: 'Pasteles', price: 4.90, description: 'Creamy cheesecake topped', image: '/images/products/slices/Dulce de Leche.jpg' },
      { id: 48, name: 'Strawberry Shortcake', category: 'Pasteles', price: 4.90, description: 'Vanilla sponge cake', image: '/images/products/slices/Strawberry.jpg' }
    ];

    return this.productsService.syncLocalProducts(products as any);
  }
}
