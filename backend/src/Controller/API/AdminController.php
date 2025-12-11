<?php

namespace App\Controller\API;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\AdRepository;
use App\Repository\EventRepository;
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
}