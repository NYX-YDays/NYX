<?php

namespace App\DataFixtures;

use App\Entity\Ad;
use App\Entity\Approach;
use App\Entity\Category;
use App\Entity\Event;
use App\Entity\File;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager)
    {
        $faker = Factory::create();

        // Créer des utilisateurs
        $users = [];
        for ($i = 0; $i < 5; $i++) {
            $user = new User();
            $user->setFirstName($faker->firstName)
                ->setLastName($faker->lastName)
                ->setEmail($faker->unique()->email)
                ->setBirthdayDate($faker->dateTimeBetween('-30 years', '-18 years'))
                ->setAddress($faker->address)
                ->setSex($faker->randomElement(['Male', 'Female', 'Other']))
                ->setPasswordHash(password_hash('password', PASSWORD_BCRYPT)) 
                ->setIsPro($faker->boolean)
                ->setPhone((int) preg_replace('/\D/', '', $faker->phoneNumber));

            $manager->persist($user);
            $users[] = $user;
        }

        // Créer des catégories
        $categories = [];
        for ($i = 0; $i < 10; $i++) {
            $category = new Category();
            $category->setTitle($faker->word);
            $manager->persist($category);
            $categories[] = $category;
        }

        // Créer des annonces pour les utilisateurs professionnels
        $ads = [];
        foreach ($users as $user) {
            if ($user->isIsPro()) {
                for ($j = 0; $j < 2; $j++) { 
                    $ad = new Ad();
                    $ad->setTitle($faker->sentence(6, true))
                        ->setPrice($faker->randomFloat(2, 5, 1000))
                        ->setDescription($faker->paragraph(3))
                        ->setPriceIndication($faker->randomElement(['Negotiable', 'Fixed', 'Discounted']))
                        ->setIsVerified($faker->boolean(70)) 
                        ->setUser($user);

                    
                    $randomCategories = $faker->randomElements($categories, mt_rand(1, 3));
                    foreach ($randomCategories as $category) {
                        $ad->addCategory($category);
                    }

                    $manager->persist($ad);
                    $ads[] = $ad;
                }
            }
        }

        // Créer des événements
        $events = [];
        for ($k = 0; $k < 20; $k++) { 
            $event = new Event();
            $event->setTitle($faker->sentence(3, true)) 
                ->setDescription($faker->paragraph(2)) 
                ->setUser($faker->randomElement($users)); 

            $manager->persist($event);
            $events[] = $event;
        }

        // // Créer des fichiers
        for ($l = 0; $l < 30; $l++) { 
            $file = new File();
            $file->setFileName($faker->word . '.jpg') 
                ->setFilePath($faker->filePath) 
                ->setDescription($faker->sentence(6, true)) 
                ->setUser($faker->randomElement($users)); 

            $manager->persist($file);
        }

        // Créer des approches
        $adsCount = count($ads);
        for ($m = 0; $m < $adsCount; $m++) {
            $ad = $ads[$m];
            $event = $events[$m % count($events)];

            $approach = new Approach();
            $approach->setState($faker->numberBetween(0, 3))
                ->setDateNotif($faker->dateTimeThisYear)
                ->setMessage($faker->sentence(10))
                ->setAd($ad)
                ->setEvent($event);

            $manager->persist($approach);
        }

        $manager->flush();
    }
}