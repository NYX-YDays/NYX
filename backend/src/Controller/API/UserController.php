<?php

namespace App\Controller\API;

use App\Constants\AppConstants;
use App\Entity\User;
use App\Repository\AdRepository;
use App\Repository\ApproachRepository;
use App\Repository\EventRepository;
use App\Repository\UserRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{

    public function __construct(private Security $security)
    {
    }

    #[Route('/api/user/events', name: 'app_user_events', methods: ['GET'])]
    public function getUserEvents(EventRepository $eventRepository, Security $security): Response
    {
        // Récupérer l'utilisateur connecté
        $user = $security->getUser();

        // Si l'utilisateur n'est pas connecté
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 404);
        }

        // Récupérer les événements en fonction de l'utilisateur
        $events = $eventRepository->findBy(['user' => $user]);

        // Si aucun événement trouvée
        if (empty($events)) {
            return $this->json(['message' => 'No events found for this user'], 200);
        }

        // Retourner les annonces avec la sérialisation appropriée
        return $this->json($events, 200, [], ['groups' => 'event:read']);
    }

    #[Route('/api/user/event/{eventId}', name: 'app_user_event', methods: ['GET'])]
    public function getUserEvent(int $eventId, EventRepository $eventRepository, Security $security): Response
    {
        // Récupérer l'utilisateur connecté
        $user = $security->getUser();

        // Si l'utilisateur n'est pas connecté
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 404);
        }

        // Récupérer les événements en fonction de l'utilisateur
        $event = $eventRepository->findOneBy(['id' => $eventId, 'user' => $user]);

        // Si aucun événement trouvée
        if (is_null($event)) {
            return $this->json(['message' => 'The event was\'n found for this user'], 200);
        }

        return $this->json($event, 200, [], ['groups' => 'event:read']);
    }

    #[Route('/api/user/events/notLinkedToAd/{adId}', name: 'app_user_events_not_linked_to_ad', methods: ['GET'])]
    public function getUserEventsNotLinkedToAd(int $adId, EventRepository $eventRepository, Security $security): Response
    {
        // Récupérer l'utilisateur connecté
        $user = $security->getUser();

        // Si l'utilisateur n'est pas connecté
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 404);
        }

        // Récupérer les événements en fonction de l'utilisateur
        $events = $eventRepository->findByNotLinkedToAd($user->getId(), $adId);

        // Retourner les annonces avec la sérialisation appropriée
        return $this->json($events, 200, [], ['groups' => 'event:read']);
    }

    #[Route('/api/user/ads', name: 'app_user_ads', methods: ['GET'])]
    public function getUserAds(AdRepository $adRepository, Security $security): Response
    {
        // Récupérer l'utilisateur connecté
        $user = $security->getUser();

        // Si l'utilisateur n'est pas connecté
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 404);
        }

        // Récupérer les annonces en fonction de l'utilisateur
        $ads = $adRepository->findBy(['user' => $user]);

        // Si aucune annonce trouvée
        if (empty($ads)) {
            return $this->json(['message' => 'No ads found for this user'], 200);
        }

        // Retourner les annonces avec la sérialisation appropriée
        return $this->json($ads, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/api/user', name: 'get_user', methods: ['GET'])]
    public function getUserById(Security $security): Response
    {
        $user = $security->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }

    #[Route('/api/user/approaches', name: 'app_user_approaches', methods: ['GET'])]
    public function getUserApproaches(ApproachRepository $approachRepository, Security $security): Response
    {
        $user = $security->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $approaches = $approachRepository->createQueryBuilder('a')
            ->join('a.ad', 'ad')
            ->where('ad.user = :userId')
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();

        return $this->json($approaches, 200, [], ['groups' => 'approach:read']);
    }

    #[Route('/api/user/approaches/{approachId}', name: 'app_user_approach', methods: ['GET'])]
    public function getUserApproach(int $approachId, ApproachRepository $approachRepository, Security $security): Response
    {
        $user = $security->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $approach = $approachRepository->createQueryBuilder('a')
            ->join('a.event', 'e')
            ->where('e.user = :userId')
            ->andWhere('a.id = :approachId')
            ->setParameter('userId', $user->getId())
            ->setParameter('approachId', $approachId)
            ->getQuery()
            ->getOneOrNullResult();

        return $this->json($approach, 200, [], ['groups' => 'approach:read']);
    }

    #[Route('/api/user/approaches/pending/count', name: 'app_user_approach_pending_count', methods: ['GET'])]
    public function getUserPendingApproachCount(ApproachRepository $approachRepository, Security $security): Response
    {
        $user = $security->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $approachCount = $approachRepository->createQueryBuilder('a')
            ->select('count(a.id)')
            ->join('a.ad', 'ad')
            ->where('ad.user = :userId')
            ->setParameter('userId', $user->getId())
            ->andWhere('a.state = 0')
            ->getQuery()
            ->getSingleScalarResult();

        return $this->json($approachCount, 200, [], ['groups' => 'approach:read']);
    }

    #[Route('/api/user', name: 'add_user', methods: ['POST'])]
    public function addUser(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        if (!isset($data['email']) || !$data['email']) {
            return $this->json(['error' => 'Email is required'], 400);
        }

        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['error' => 'Email already in use'], 409);
        }

        $user = new User();
        $user->setFirstName($data['firstName'] ?? null);
        $user->setLastName($data['lastName'] ?? null);
        $user->setEmail($data['email'] ?? null);
        $user->setAddress($data['address'] ?? null);
        $user->setSex($data['sex'] ?? null);
        $user->setBio($data['bio'] ?? null);
        $user->setPhone($data['phone'] ?? null);
        $user->setRoles($data['roles'] ?? [AppConstants::ROLE_INDIVIDUAL]);

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

    #[Route('/api/user/{userId}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(int $userId, Request $request, EntityManagerInterface $entityManager, UserRepository $userRepository, UserPasswordHasherInterface $passwordHasher): Response
    {
        $user = $userRepository->find($userId);

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
        $user->setBio($data['bio'] ?? $user->getBio());
        $user->setPhone($data['phone'] ?? $user->getPhone());
        $user->setRoles($data['roles'] ?? [AppConstants::ROLE_INDIVIDUAL]);

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

    #[Route('/api/user/{userId}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(int $userId, EntityManagerInterface $entityManager, UserRepository $userRepository): Response
    {
        $user = $userRepository->find($userId);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(null, 204);
    }
}