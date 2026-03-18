<?php

namespace App\Controller\API;

use App\Entity\User;
use App\Entity\Ad;
use App\Entity\Event;
use App\Entity\Category;
use App\Repository\UserRepository;
use App\Repository\AdRepository;
use App\Repository\EventRepository;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    #[Route('/stats', name: 'api_admin_stats', methods: ['GET'])]
    public function getStats(
        UserRepository $userRepository,
        AdRepository $adRepository,
        EventRepository $eventRepository,
        CategoryRepository $categoryRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Ajout du compteur d'approches avec EntityManager
        $approachCount = $entityManager
            ->getRepository(\App\Entity\Approach::class)
            ->count([]);
        return new JsonResponse([
            'userCount' => $userRepository->count([]),
            'adCount' => $adRepository->count([]),
            'eventCount' => $eventRepository->count([]),
            'categoryCount' => $categoryRepository->count([]),
            'approachCount' => $approachCount
        ]);
    }

    #[Route('/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function listUsers(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        return $this->json($users, 200, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/{id}', name: 'api_admin_users_show', methods: ['GET'])]
    public function showUser(User $user): JsonResponse
    {
        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }

    #[Route('/users/{id}/roles', name: 'api_admin_users_update_roles', methods: ['PUT'])]
    public function updateUserRoles(User $user, Request $request, EntityManagerInterface $em): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['roles']) || !is_array($data['roles'])) {
            return new JsonResponse(['error' => 'Invalid roles data'], 400);
        }

        // Valider les rôles
        $validRoles = ['ROLE_INDIVIDUAL', 'ROLE_SERVICE_PROVIDER', 'ROLE_ADMIN'];
        foreach ($data['roles'] as $role) {
            if (!in_array($role, $validRoles)) {
                return new JsonResponse(['error' => 'Invalid role: ' . $role], 400);
            }
        } 

        // S'assurer que ROLE_INDIVIDUAL est toujours présent
        if (!in_array('ROLE_INDIVIDUAL', $data['roles'])) {
            $data['roles'][] = 'ROLE_INDIVIDUAL';
        }

        $user->setRoles($data['roles']);
        $em->flush();

        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }

    #[Route('/users/{id}', name: 'api_admin_users_update', methods: ['PUT'])]
    public function updateUser(User $user, Request $request, EntityManagerInterface $em, UserRepository $userRepository): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        // Mettre à jour les champs de l'utilisateur
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }

        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }

        if (isset($data['email'])) {
            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            $existingUser = $userRepository->findOneBy(['email' => $data['email']]);
            if ($existingUser && $existingUser->getId() !== $user->getId()) {
                return new JsonResponse(['error' => 'Email already in use'], 400);
            }
            $user->setEmail($data['email']);
        }

        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        if (isset($data['address'])) {
            $user->setAddress($data['address']);
        }

        if (isset($data['sex'])) {
            $user->setSex($data['sex']);
        }

        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }

        if (isset($data['birthdayDate'])) {
            try {
                $birthdayDate = new \DateTime($data['birthdayDate']);
                $user->setBirthdayDate($birthdayDate);
            } catch (\Exception $e) {
                // Ignorer si la date est invalide
            }
        }

        if (isset($data['roles']) && is_array($data['roles'])) {
            // S'assurer que ROLE_INDIVIDUAL est toujours présent
            if (!in_array('ROLE_INDIVIDUAL', $data['roles'])) {
                $data['roles'][] = 'ROLE_INDIVIDUAL';
            }
            $user->setRoles($data['roles']);
        }

        $em->flush();
        return $this->json($user, 200, [], ['groups' => 'user:read']);
    }

    #[Route('/users/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    public function deleteUser(User $user, EntityManagerInterface $em): JsonResponse
    {
        // Empêcher la suppression de son propre compte
        if ($this->getUser()->getUserIdentifier() === $user->getEmail()) {
            return new JsonResponse(['error' => 'Cannot delete your own account'], 403);
        }

        try {
            $em->remove($user);
            $em->flush();

            return new JsonResponse(['message' => 'Utilisateur supprimé avec succès'], 200);
        } catch (\Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException $e) {
            return new JsonResponse([
                'error' => 'Impossible de supprimer cet utilisateur. Il est lié à d\'autres données (annonces, événements, fichiers, etc.).'
            ], 409); // 409 = Conflict
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la suppression de l\'utilisateur.'
            ], 500);
        }
    }

    // ==================== ADS MANAGEMENT ====================

    #[Route('/ads', name: 'api_admin_ads_list', methods: ['GET'])]
    public function listAds(AdRepository $adRepository): JsonResponse
    {
        $ads = $adRepository->findAll();
        return $this->json($ads, 200, [], ['groups' => ['ad:read']]);
    }

    #[Route('/ads/{id}', name: 'api_admin_ads_show', methods: ['GET'])]
    public function showAd(Ad $ad): JsonResponse
    {
        return $this->json($ad, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/ads/{id}', name: 'api_admin_ads_update', methods: ['PUT'])]
    public function updateAd(Ad $ad, Request $request, EntityManagerInterface $em, CategoryRepository $categoryRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        if (isset($data['title'])) {
            $ad->setTitle($data['title']);
        }

        if (isset($data['description'])) {
            $ad->setDescription($data['description']);
        }

        if (isset($data['price'])) {
            $ad->setPrice((float) $data['price']);
        }

        if (isset($data['priceIndication'])) {
            $ad->setPriceIndication($data['priceIndication']);
        }

        if (array_key_exists('isVerified', $data)) {
            $ad->setIsVerified((bool) $data['isVerified']);
        }

        if (isset($data['datePublicationAd'])) {
            try {
                $datePublicationAd = new \DateTime($data['datePublicationAd']);
                $ad->setDatePublicationAd($datePublicationAd);
            } catch (\Exception $e) {
                // Ignorer si la date est invalide
            }
        }

        // Mise à jour des catégories
        if (isset($data['categories']) && is_array($data['categories'])) {
            // Supprimer les catégories existantes
            foreach ($ad->getCategories() as $category) {
                $ad->removeCategory($category);
            }
            // Ajouter les nouvelles catégories
            foreach ($data['categories'] as $categoryId) {
                $category = $categoryRepository->find($categoryId);
                if ($category) {
                    $ad->addCategory($category);
                }
            }
        }

        $em->flush();
        return $this->json($ad, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/ads/{id}/verify', name: 'api_admin_ads_verify', methods: ['PUT'])]
    public function toggleAdVerification(Ad $ad, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['isVerified'])) {
            return new JsonResponse(['error' => 'isVerified field is required'], 400);
        }

        $ad->setIsVerified((bool) $data['isVerified']);
        $em->flush();

        return $this->json($ad, 200, [], ['groups' => 'ad:read']);
    }

    #[Route('/ads/{id}', name: 'api_admin_ads_delete', methods: ['DELETE'])]
    public function deleteAd(Ad $ad, EntityManagerInterface $em): JsonResponse
    {
        try {
            $em->remove($ad);
            $em->flush();

            return new JsonResponse(['message' => 'Annonce supprimée avec succès'], 200);
        } catch (\Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException $e) {
            return new JsonResponse([
                'error' => 'Impossible de supprimer cette annonce. Elle est liée à d\'autres données.'
            ], 409);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la suppression de l\'annonce.'
            ], 500);
        }
    }

    // ==================== EVENTS MANAGEMENT ====================

    #[Route('/events', name: 'api_admin_events_list', methods: ['GET'])]
    public function listEvents(EventRepository $eventRepository): JsonResponse
    {
        $events = $eventRepository->findAll();
        return $this->json($events, 200, [], ['groups' => ['event:read', 'user:read']]);
    }

    #[Route('/events/{id}', name: 'api_admin_events_show', methods: ['GET'])]
    public function showEvent(Event $event): JsonResponse
    {
        return $this->json($event, 200, [], ['groups' => ['event:read', 'user:read']]);
    }

    #[Route('/events/{id}', name: 'api_admin_events_update', methods: ['PUT'])]
    public function updateEvent(Event $event, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        if (isset($data['title'])) {
            $event->setTitle($data['title']);
        }

        if (isset($data['description'])) {
            $event->setDescription($data['description']);
        }

        if (isset($data['dateEvent'])) {
            try {
                $dateEvent = new \DateTime($data['dateEvent']);
                $event->setDateEvent($dateEvent);
            } catch (\Exception $e) {
                // Ignorer si la date est invalide
            }
        }

        $em->flush();
        return $this->json($event, 200, [], ['groups' => ['event:read', 'user:read']]);
    }

    #[Route('/events/{id}', name: 'api_admin_events_delete', methods: ['DELETE'])]
    public function deleteEvent(Event $event, EntityManagerInterface $em): JsonResponse
    {
        try {
            // Vérifier si l'événement a des approches liées
            if ($event->getApproaches()->count() > 0) {
                return new JsonResponse([
                    'error' => 'Impossible de supprimer cet événement. Il est lié à des approches.'
                ], 409);
            }
            
            $em->remove($event);
            $em->flush();

            return new JsonResponse(['message' => 'Événement supprimé avec succès'], 200);
        } catch (\Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException $e) {
            return new JsonResponse([
                'error' => 'Impossible de supprimer cet événement. Il est lié à d\'autres données.'
            ], 409);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la suppression de l\'événement.'
            ], 500);
        }
    }

    // ==================== CATEGORIES MANAGEMENT ====================

    #[Route('/categories', name: 'api_admin_categories_list', methods: ['GET'])]
    public function listCategories(CategoryRepository $categoryRepository): JsonResponse
    {
        $categories = $categoryRepository->findAll();
        return $this->json($categories, 200, [], ['groups' => ['category:read']]);
    }

    #[Route('/categories/{id}', name: 'api_admin_categories_show', methods: ['GET'])]
    public function showCategory(Category $category): JsonResponse
    {
        return $this->json($category, 200, [], ['groups' => ['category:read']]);
    }

    #[Route('/categories', name: 'api_admin_categories_create', methods: ['POST'])]
    public function createCategory(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['title']) || empty(trim($data['title']))) {
            return new JsonResponse(['error' => 'Le titre est requis'], 400);
        }

        $category = new Category();
        $category->setTitle(trim($data['title']));

        $em->persist($category);
        $em->flush();

        return $this->json($category, 201, [], ['groups' => ['category:read']]);
    }

    #[Route('/categories/{id}', name: 'api_admin_categories_update', methods: ['PUT'])]
    public function updateCategory(Category $category, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        if (isset($data['title'])) {
            if (empty(trim($data['title']))) {
                return new JsonResponse(['error' => 'Le titre ne peut pas être vide'], 400);
            }
            $category->setTitle(trim($data['title']));
        }

        $em->flush();
        return $this->json($category, 200, [], ['groups' => ['category:read']]);
    }

    #[Route('/categories/{id}', name: 'api_admin_categories_delete', methods: ['DELETE'])]
    public function deleteCategory(Category $category, EntityManagerInterface $em): JsonResponse
    {
        try {
            // Vérifier si la catégorie est utilisée par des annonces
            if ($category->getAds()->count() > 0) {
                return new JsonResponse([
                    'error' => 'Impossible de supprimer cette catégorie. Elle est utilisée par ' . $category->getAds()->count() . ' annonce(s).'
                ], 409);
            }

            $em->remove($category);
            $em->flush();

            return new JsonResponse(['message' => 'Catégorie supprimée avec succès'], 200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la suppression de la catégorie.'
            ], 500);
        }
    }

    // ==================== APPROACHES MANAGEMENT ====================

    #[Route('/approaches', name: 'api_admin_approaches_list', methods: ['GET'])]
    public function listApproaches(EntityManagerInterface $entityManager): JsonResponse
    {
        $approaches = $entityManager->getRepository(\App\Entity\Approach::class)->findAll();
        return $this->json(
            $approaches,
            200,
            [],
            [
                'groups' => ['approach:read', 'ad:read', 'event:read', 'user:read'],
                'circular_reference_handler' => function ($object) {
                    return $object->getId();
                }
            ]
        );
    }

    #[Route('/approaches/{id}', name: 'api_admin_approaches_update', methods: ['PUT'])]
    public function updateApproach(\App\Entity\Approach $approach, Request $request, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!is_array($data)) {
                return new JsonResponse([
                    'error' => 'Contenu JSON invalide.'
                ], 400);
            }
            
            if (isset($data['message']) && is_string($data['message'])) {
                $approach->setMessage($data['message']);
            }
            
            if (isset($data['state']) && is_numeric($data['state'])) {
                $approach->setState((int)$data['state']);
            }
            
            $em->flush();
            
            return $this->json($approach, 200, [], [
                'groups' => ['approach:read', 'ad:read', 'event:read', 'user:read'],
                'circular_reference_handler' => function ($object) {
                    return $object->getId();
                }
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la mise à jour de l\'approche : ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/approaches/{id}', name: 'api_admin_approaches_delete', methods: ['DELETE'])]
    public function deleteApproach(\App\Entity\Approach $approach, EntityManagerInterface $em): JsonResponse
    {
        try {
            $em->remove($approach);
            $em->flush();

            return new JsonResponse(['message' => 'Approche supprimée avec succès'], 200);
        } catch (\Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException $e) {
            return new JsonResponse([
                'error' => 'Impossible de supprimer cette approche. Elle est liée à d\'autres données.'
            ], 409);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la suppression de l\'approche.'
            ], 500);
        }
    }
}