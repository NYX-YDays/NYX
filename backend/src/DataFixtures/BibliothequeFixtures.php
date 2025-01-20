<?php

namespace App\DataFixtures;

use App\Entity\Auteur;
use App\Entity\Categorie;
use App\Entity\Emprunt;
use App\Entity\Livre;
use App\Entity\Reservation;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;


class BibliothequeFixtures extends Fixture
{

    public function load(ObjectManager $manager): void
    {
        // Init.
        $faker = Factory::create('fr_FR');
        $users = [];
        $auteurs = [];
        $livres = [];
        $categories = [];
        $livresEmpruntes = [];

        // Ajout compte responsable par défaut
        $dateAdmin = DateTimeImmutable::createFromMutable($faker->dateTime());
        $admin = (new User())->setEmail("admin@gmail.com")
                             ->setPassword(password_hash("admin",PASSWORD_DEFAULT))
                             ->setNom("ADMIN")
                             ->setPrenom("Admin")
                             ->setDateAdhesion($dateAdmin)
                             ->setRoles(['ROLE_SUPER_ADMIN','ROLE_USER']);
        $manager->persist($admin);

        // Ajout compte bibliothécaire par défaut
        $biblio = (new User())->setEmail("bibli@gmail.com")
                             ->setPassword(password_hash("bibli",PASSWORD_DEFAULT))
                             ->setNom($faker->lastName())
                             ->setPrenom($faker->firstName())
                             ->setDateAdhesion($dateAdmin)
                             ->setRoles(['ROLE_ADMIN','ROLE_USER']);
        $manager->persist($biblio);

        for($i=0;$i<30;$i++){
            // Ajout comptes adhérents générés
            $date = DateTimeImmutable::createFromMutable($faker->dateTime());
            $user = (new User())->setEmail($faker->email())
                                ->setPassword(password_hash("user",PASSWORD_DEFAULT))
                                ->setNom($faker->lastName())
                                ->setPrenom($faker->firstName())
                                ->setDateAdhesion($date)
                                ->setAdressePostale($faker->address())
                                ->setRoles(['ROLE_USER']);
            $users[] = $user;
            $manager->persist($user);

            // Ajout auteurs générés
            $auteur = (new Auteur())->setNom($faker->lastName())
                                    ->setPrenom($faker->firstName())
                                    ->setDateNaissance($date)
                                    ->setNationalite($faker->languageCode());
            $auteurs[] = $auteur;
            $manager->persist($auteur);
        }

        // Ajout catégories générées
        for($i=0;$i<5;$i++){
            $categorie = (new Categorie())->setNom($faker->word(2))
                                          ->setDescription($faker->text());
            $categories[] = $categorie;
            $manager->persist($categorie);
        }

        // Ajout livres générés
        for($i=0;$i<30;$i++){
            $dateOut = DateTimeImmutable::createFromMutable($faker->dateTime());
            $livre = (new Livre())->setTitre($faker->name())
                                  ->setDateSortie($dateOut)
                                  ->setPhotoCouverture("https://picsum.photos/360/360?image=".($i+100))
                                  ->setLangue($faker->languageCode())
                                  ->setSynopsis($faker->paragraph(rand(5, 15)));
            for($y=rand(0,count($categories)-1);$y<count($categories)-1;$y++){
                $livre->addCategory($categories[$y]);
            }
            for($y=rand(0,count($auteurs)-1);$y<count($auteurs)-1;$y++){
                $livre->addAuteur($auteurs[$y]);
            }
            $livres[] = $livre;
            $manager->persist($livre);
        }

        for($i=0;$i<30;$i++){

            // Gestion aléatoire livres réservés
            if (rand(1, 4) == 3) {
                $randUR = $users[rand(0,count($users)-1)]; //random user for reservations
                $randLR = $livres[rand(0,count($livres)-1)]; //random book for reservations
                $manager->persist($randUR);
                $manager->persist($randLR);
                $reservation = (new Reservation())->setDateResa(DateTimeImmutable::createFromMutable($faker->dateTime()))
                    ->setUser($randUR)
                    ->setLivre($randLR);
                $manager->persist($reservation);
                $randUR->addReservation($reservation);
                $randLR->addReservation($reservation);
            }

            // Gestion aléatoire livres empruntés
            if (rand(1, 4) == 3) {
                $randUE = $users[rand(0, count($users) - 1)]; //random user for emprunt
                $randLE = $livres[rand(0, count($livres) - 1)]; //random book for emprunt
                if (in_array($randLE, $livresEmpruntes)) continue;
                $livresEmpruntes[] = $randLE;
                $manager->persist($randUE);
                $manager->persist($randLE);
                $emprunt = (new Emprunt())->setDateEmprunt(DateTimeImmutable::createFromMutable($faker->dateTime()))
                    ->setUser($randUE)
                    ->setLivre($randLE)
                    ->setDateRetour(rand(1, 3) == 2 ? DateTimeImmutable::createFromMutable($faker->dateTime()) : null);
                $manager->persist($emprunt);
                $randUE->addEmprunt($emprunt);
                $randLE->addEmprunt($emprunt);
            }
        }

        $manager->flush();
    }

}