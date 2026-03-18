<?php

namespace App\Controller\API;

use App\Constants\AppConstants;
use App\Entity\File;
use App\Repository\FileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileController extends AbstractController
{
    #[Route('/api/file', name: 'add_file', methods: ['POST'])]
    public function createFile(Request $request, EntityManagerInterface $entityManager, FileRepository $fileRepository, Security $security): Response {
        
        // Vérifier si l'utilisateur est authentifié
        $currentUser = $security->getUser();
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated'], 401);
        }

        // Vérifier le type de fichier
        $fileType = $request->request->get('fileType');
        if (!in_array($fileType, [AppConstants::FILE_TYPE_PROFILE_PICTURE, AppConstants::FILE_TYPE_BANNER], true)) {
            return new JsonResponse(['error' => 'Invalid file type. Must be "profile_picture" or "banner"'], 400);
        }

        // Vérifier si l'utilisateur a déjà un fichier de ce type
        $existingFile = $fileRepository->findOneBy([
            'user' => $currentUser,
            'fileType' => $fileType
        ]);

        if ($existingFile) {
            return new JsonResponse(['error' => "You already have a $fileType. Please modify or delete it first."], 400);
        }

        // Traitement du fichier
        /** @var UploadedFile $file */
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded'], 400);
        }

        $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/';
        $fileName = uniqid() . '.' . $file->guessExtension();

        try {
            $file->move($uploadsDir, $fileName);
        } catch (FileException $e) {
            return new JsonResponse(['error' => 'File upload failed'], 500);
        }

        $fileEntity = new File();
        $fileEntity->setFileName($fileName);
        $fileEntity->setFilePath($fileName);
        $fileEntity->setFileType($fileType);
        $fileEntity->setUser($currentUser);

        $entityManager->persist($fileEntity);
        $entityManager->flush();

        return new JsonResponse(['message' => 'File uploaded successfully'], 201);
    }

    #[Route('/api/file/{fileId}', name: 'update_file', methods: ['POST'])]
    public function updateFile($fileId, Request $request, EntityManagerInterface $entityManager, FileRepository $fileRepository, Security $security): Response {
        
        // Vérifier si l'utilisateur est authentifié
        $currentUser = $security->getUser();
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated'], 401);
        }

        // Vérifier si le fichier existe et appartient à l'utilisateur
        $fileEntity = $fileRepository->find($fileId);
        if (!$fileEntity || $fileEntity->getUser() !== $currentUser) {
            return new JsonResponse(['error' => 'File not found or unauthorized'], 404);
        }

        // Modifier le fichier (nouveau fichier peut être envoyé)
        /** @var UploadedFile $file */
        $file = $request->files->get('file');   

        if ($file) {
            // Supprimer l'ancien fichier du serveur
            $oldFilePath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $fileEntity->getFilePath();
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }

            $fileName = uniqid() . '.' . $file->guessExtension();
            try {
                $file->move($this->getParameter('kernel.project_dir') . '/public/uploads/', $fileName);
                $fileEntity->setFileName($fileName);
                $fileEntity->setFilePath($fileName);
            } catch (FileException $e) {
                return new JsonResponse(['error' => 'File upload failed'], 500);
            }
        }

        $entityManager->persist($fileEntity);
        $entityManager->flush();

        return new JsonResponse(['message' => 'File updated successfully'], 200);
    }

    #[Route('/api/file/{fileId}', name: 'delete_file', methods: ['DELETE'])]
    public function deleteFile($fileId, EntityManagerInterface $entityManager, FileRepository $fileRepository, Security $security): Response {
        $currentUser = $security->getUser();
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated'], 401);
        }

        $fileEntity = $fileRepository->find($fileId);
        if (!$fileEntity || $fileEntity->getUser() !== $currentUser) {
            return new JsonResponse(['error' => 'File not found or unauthorized'], 404);
        }

        // Supprimer le fichier du serveur
        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $fileEntity->getFilePath();
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Supprimer l'entrée de la BDD
        $entityManager->remove($fileEntity);
        $entityManager->flush();

        return new JsonResponse(['message' => 'File deleted successfully'], 200);
    }
}
