<?php

namespace App\Controller\API;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\AdRepository;
use App\Repository\ApproachRepository;
use App\Repository\EventRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use DateTime;

class UserController extends AbstractController
{

    public function __construct(private Security $security) {}

    // #[Route('/api/user', methods: ['GET'])]
    // public function getCustomer()
    // {
    //     $user = $this->security->getUser();
    //     if (!empty($user)) {
    //         return new JsonResponse($user);
    //     } else {
    //         return new JsonResponse(null, 404);
    //     }
    // }

    // #[Route('/api/user', methods: ['PUT'])]
    // public function setAdherent(Request $request, EntityManagerInterface $entityManager): JsonResponse
    // {
    //     $data = json_decode($request->getContent(), true);
    //     $user = $this->security->getUser();
    //     if (!isset($user)) return new JsonResponse(null, 404);
    //     if (isset($data['prenom'])) $user->setPrenom($data['prenom']);
    //     if (isset($data['nom'])) $user->setNom($data['nom']);
    //     if (isset($data['photo'])) $user->setPhoto($data['photo']);
    //     if (isset($data['adresse_postale'])) $user->setAdressePostale($data['adresse_postale']);
    //     if (isset($data['date_naissance'])) $user->setDateNaissance(date_create_immutable_from_format('Y-m-d', $data['date_naissance']));
    //     if (isset($data['num_tel'])) $user->setNumTel($data['num_tel']);
    //     $entityManager->persist($user);
    //     $entityManager->flush();
    //     return $this->json($user, JsonResponse::HTTP_CREATED);
    // }

    #[Route('/api/user/{id}', name: 'get_user_by_id', methods: ['GET'])]
    public function getUserById(int $id, UserRepository $userRepository): Response
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }

    #[Route('/api/user/{userId}/ads', name: 'app_user_ads', methods: ['GET'])]
    public function getUserAds($userId, AdRepository $adRepository): Response
    {
        // Récupérer les annonces en fonction de l'utilisateur
        $ads = $adRepository->findBy(['user' => $userId]);

        // Si aucune annonce trouvée
        if (empty($ads)) {
            return $this->json(['error' => 'No ads found for this user'], 404);
        }   

        // Retourner les annonces avec la sérialisation appropriée
        return $this->json($ads, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/user/{userId}/events', name: 'app_user_events', methods: ['GET'])]
    public function getUserEvents($userId, EventRepository $eventRepository): Response
    {
        // Récupérer les événements en fonction de l'utilisateur
        $ads = $eventRepository->findBy(['user' => $userId]);

        // Si aucun événement trouvée
        if (empty($ads)) {
            return $this->json(['error' => 'No ads found for this user'], 404);
        }   

        // Retourner les annonces avec la sérialisation appropriée
        return $this->json($ads, 200, [], ['groups' => 'event:read']);
    }

    #[Route('/api/user/{userId}/approaches', name: 'app_user_approaches', methods: ['GET'])]
    public function getUserApproaches($userId, ApproachRepository $approachRepository, UserRepository $userRepository): Response
    {
        $user = $userRepository->find($userId);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $approaches = $approachRepository->createQueryBuilder('a')
            ->join('a.ad', 'ad')
            ->where('ad.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();
        
        return $this->json($approaches, 200, [], ['groups' => 'approach:read']);
    }

    #[Route('/api/user', name: 'add_user', methods: ['POST'])]
    public function addUser(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        $user = new User();
        $user->setFirstName($data['firstName'] ?? null);
        $user->setLastName($data['lastName'] ?? null);
        $user->setEmail($data['email'] ?? null);
        $user->setAddress($data['address'] ?? null);
        $user->setSex($data['sex'] ?? null);
        $user->setIsPro($data['isPro'] ?? false);
        $user->setPhone($data['phone'] ?? null);

        if (isset($data['birthdayDate']) && $data['birthdayDate']) {
            $birthdayDate = DateTime::createFromFormat('Y-m-d', $data['birthdayDate']);
            if (!$birthdayDate) {
                return $this->json(['error' => 'Invalid date format for birthdayDate'], 400);
            }
            $user->setBirthdayDate($birthdayDate);
        } else {
            $user->setBirthdayDate(null);
        }

        if (isset($data['password'])) {
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        } else {
            return $this->json(['error' => 'Password is required'], 400);
        }

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($user, 201, [], ['groups' => 'user:read']);
    }

    #[Route('/api/user/{id}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(int $id, Request $request, EntityManagerInterface $entityManager, UserRepository $userRepository, UserPasswordHasherInterface $passwordHasher): Response {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        $user->setFirstName($data['firstName'] ?? $user->getFirstName());
        $user->setLastName($data['lastName'] ?? $user->getLastName());
        $user->setEmail($data['email'] ?? $user->getEmail());
        $user->setAddress($data['address'] ?? $user->getAddress());
        $user->setSex($data['sex'] ?? $user->getSex());
        $user->setIsPro($data['isPro'] ?? $user->isIsPro());
        $user->setPhone($data['phone'] ?? $user->getPhone());

        if (isset($data['birthdayDate']) && $data['birthdayDate']) {
            $birthdayDate = DateTime::createFromFormat('Y-m-d', $data['birthdayDate']);
            if (!$birthdayDate) {
                return $this->json(['error' => 'Invalid date format for birthdayDate'], 400);
            }
            $user->setBirthdayDate($birthdayDate);
        } else {
            $user->setBirthdayDate($user->getBirthdayDate());
        }

        if (isset($data['password'])) {
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $entityManager->flush();

        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }

    #[Route('/api/user/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(int $id, EntityManagerInterface $entityManager, UserRepository $userRepository): Response
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(null, 204);
    }
}