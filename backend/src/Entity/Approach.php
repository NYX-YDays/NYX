<?php

namespace App\Entity;

use App\Repository\ApproachRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ApproachRepository::class)]
#[ORM\UniqueConstraint(name: 'unique_event_ad', columns: ['event_id', 'ad_id'])]
class Approach
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['event:read', 'approach:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['event:read', 'approach:read'])]
    private ?int $state = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['event:read', 'approach:read'])]
    private ?\DateTimeInterface $dateNotif = null;

    #[ORM\Column(length: 255)]
    #[Groups(['event:read', 'approach:read'])]
    private ?string $message = null;

    #[ORM\ManyToOne(targetEntity: Ad::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['event:read', 'approach:read'])]
    private ?Ad $ad = null;

    #[ORM\ManyToOne(targetEntity: Event::class, inversedBy: 'approaches')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['approach:read'])]    
    private ?Event $event = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getState(): ?int
    {
        return $this->state;
    }

    public function setState(int $state): static
    {
        $this->state = $state;

        return $this;
    }

    public function getDateNotif(): ?\DateTimeInterface
    {
        return $this->dateNotif;
    }

    public function setDateNotif(\DateTimeInterface $dateNotif): static
    {
        $this->dateNotif = $dateNotif;

        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getAd(): ?Ad
    {
        return $this->ad;
    }

    public function setAd(?Ad $ad): static
    {
        $this->ad = $ad;

        return $this;
    }

    public function getEvent(): ?Event
    {
        return $this->event;
    }

    public function setEvent(?Event $event): static
    {
        $this->event = $event;

        return $this;
    }
}
