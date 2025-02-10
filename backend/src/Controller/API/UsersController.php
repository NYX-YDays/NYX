<?php

namespace App\Controller\API;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\AdRepository;
use App\Repository\ApproachRepository;
use App\Repository\EventRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Users;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;

class UsersController extends AbstractController
{

    public function __construct(private Security $security) {}

    #[Route('/api/user', methods: ['GET'])]
    public function getCustomer()
    {
        $user = $this->security->getUser();
        if (!empty($user)) {
            return new JsonResponse($user);
        } else {
            return new JsonResponse(null, 404);
        }
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

    #[Route('/api/approaches/{userId}', name: 'app_user_approaches', methods: ['GET'])]
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
}