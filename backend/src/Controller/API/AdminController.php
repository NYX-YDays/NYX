<?php

namespace App\Controller\API;

use App\Entity\User;
use App\Entity\Ad;
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
        EventRepository $eventRepository
    ): JsonResponse {
        return new JsonResponse([
            'userCount' => $userRepository->count([]),
            'adCount' => $adRepository->count([]),
            'eventCount' => $eventRepository->count([])
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
}