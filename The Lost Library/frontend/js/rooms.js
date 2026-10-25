
/**
 * The Lost Library - Rooms & Chapters
 * Each chapter contains its own story, clues and puzzle.
 */

const ROOMS = {
    1: {
        chapterNumber: 1,
        title: "The Forgotten Entrance",
        eyebrow: "CHAPTER ONE · THE FORGOTTEN DOOR",
        storyGreeting:
            "On a quiet evening, you discover an old library hidden behind a forgotten doorway. Dust covers the bookshelves, strange symbols mark the walls, and a mysterious golden book rests on a wooden table.",
        storyQuestion: "What will you do next?",
        description:
            "Dust fills the silent entrance hall. Search the three ancient relics to break the seal guarding the path ahead.",
        puzzleTitle: "The Seal of the Ancient Door",
        puzzleStory:
            "The three clues illuminate the glowing glyphs upon the heavy stone door. Solve the mathematical riddle to break the first seal.",
        unlockMessage:
            "The stone lock yields. Beyond lies the Grand Archive!",
        items: [
            {
                id: "book",
                icon: "📕",
                name: "The Golden Book",
                shortDesc: "An ancient tome bound in gilded leather rests upon a pedestal.",
                title: "The Golden Book",
                message:
                    "Knowledge opens doors that keys cannot. Observe the pattern of symbols to decipher the truth."
            },
            {
                id: "note",
                icon: "📜",
                name: "The Mysterious Note",
                shortDesc: "A brittle piece of parchment lies beneath a stone tablet.",
                title: "The Mysterious Note",
                message:
                    "Three ancient relics guard this threshold. Find each relic's secret before you challenge the seal."
            },
            {
                id: "door",
                icon: "🚪",
                name: "The Locked Door",
                shortDesc: "Massive oak reinforced with bronze bands and glowing runes.",
                title: "The Locked Door",
                message:
                    "Arithmetic runes cover the door. It will remain barred until all three clues activate the challenge."
            }
        ]
    },

    2: {
        chapterNumber: 2,
        title: "The Grand Archive",
        eyebrow: "CHAPTER TWO · THE GRAND ARCHIVE",
        storyGreeting:
            "You descend a winding spiral staircase into a majestic circular chamber. Towering shelves hold thousands of manuscripts beneath a ceiling painted with stellar constellations.",
        storyQuestion: "Will you inspect the archive?",
        description:
            "Three legendary artifacts guard the entrance to the Cryptic Vault.",
        puzzleTitle: "The Riddle of the Cryptic Vault",
        puzzleStory:
            "The celestial artifacts align. A mathematical equation appears on the vault door.",
        unlockMessage:
            "The vault opens, revealing a passage to the Hall of Echoes!",
        items: [
            {
                id: "grimoire",
                icon: "📖",
                name: "The Archivist's Grimoire",
                shortDesc: "A colossal manuscript filled with astronomical charts.",
                title: "The Archivist's Grimoire",
                message:
                    "The cosmos speaks in numbers. Solve the arithmetic proportion to uncover the secret of the vault."
            },
            {
                id: "astrolabe",
                icon: "🧭",
                name: "The Brass Astrolabe",
                shortDesc: "A mechanical instrument with rotating concentric rings.",
                title: "The Brass Astrolabe",
                message:
                    "You align the planetary rings. A hidden compartment reveals coordinates: 37°N, 23°E."
            },
            {
                id: "vault",
                icon: "🗝️",
                name: "The Cryptic Vault",
                shortDesc: "A solid vault embedded in an obsidian pedestal.",
                title: "The Cryptic Vault",
                message:
                    "A magical projection displays numerical glyphs. Enter the correct calculation to open the vault."
            }
        ]
    },

    3: {
        chapterNumber: 3,
        title: "The Hall of Echoes",
        eyebrow: "CHAPTER THREE · THE HALL OF ECHOES",
        storyGreeting:
            "Beyond the vault, you enter a long hall where every footstep returns as a whisper. Portraits of forgotten librarians watch from the walls, and a silver lantern burns without a flame.",
        storyQuestion: "Which secret will you uncover first?",
        description:
            "The hall repeats fragments of the library's lost history. Inspect the three relics to discover the passage to the Forbidden Collection.",
        puzzleTitle: "The Echoing Cipher",
        puzzleStory:
            "The whispers merge into a pattern of glowing numbers. Solve the mathematical challenge to silence the enchanted hall.",
        unlockMessage:
            "The echoes fade, and a hidden staircase reveals the Forbidden Collection!",
        items: [
            {
                id: "lantern",
                icon: "🏮",
                name: "The Silver Lantern",
                shortDesc: "A cold silver lantern shines with an impossible light.",
                title: "The Silver Lantern",
                message:
                    "The lantern reveals words invisible to ordinary eyes: 'Listen carefully, for every answer begins with a question.'"
            },
            {
                id: "portrait",
                icon: "🖼️",
                name: "The Forgotten Portrait",
                shortDesc: "A faded portrait depicts the library's first keeper.",
                title: "The Forgotten Portrait",
                message:
                    "The keeper's inscription reads: 'No secret is lost while someone remembers where to look.'"
            },
            {
                id: "mirror",
                icon: "🪞",
                name: "The Whispering Mirror",
                shortDesc: "A tall mirror reflects the hall as it appeared centuries ago.",
                title: "The Whispering Mirror",
                message:
                    "The reflection reveals a numerical seal hidden behind the frame. The seal awaits the correct answer."
            }
        ]
    },

    4: {
        chapterNumber: 4,
        title: "The Forbidden Collection",
        eyebrow: "CHAPTER FOUR · THE FINAL SECRET",
        storyGreeting:
            "At the end of the staircase stands a chamber untouched by time. Its shelves contain books with no titles, and at the center rests the Codex of Eternity—the book that may explain why the library disappeared.",
        storyQuestion: "Are you ready to reveal the library's final secret?",
        description:
            "The final chamber is protected by three ancient relics. Discover their messages and face the last seal.",
        puzzleTitle: "The Codex Seal",
        puzzleStory:
            "The Codex opens a page of shifting mathematical symbols. Solve the challenge to reveal the truth hidden inside the library.",
        unlockMessage:
            "The final seal breaks. The Codex of Eternity reveals the library's forgotten history!",
        items: [
            {
                id: "codex",
                icon: "📚",
                name: "The Codex of Eternity",
                shortDesc: "A legendary book bound in dark leather and golden thread.",
                title: "The Codex of Eternity",
                message:
                    "The first page reads: 'Every journey begins with curiosity, but wisdom comes from solving what lies ahead.'"
            },
            {
                id: "key",
                icon: "🗝️",
                name: "The Golden Key",
                shortDesc: "A golden key floats above a stone pedestal.",
                title: "The Golden Key",
                message:
                    "The key has no teeth. Instead, its surface displays a changing sequence of numbers."
            },
            {
                id: "seal",
                icon: "🔮",
                name: "The Final Seal",
                shortDesc: "A glowing crystal guards the heart of the chamber.",
                title: "The Final Seal",
                message:
                    "The crystal pulses with ancient energy. The library's last barrier will yield only to a correct answer."
            }
        ]
    }
};

window.ROOMS = ROOMS;
