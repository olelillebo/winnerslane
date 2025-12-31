import { ChevronDown, Shuffle } from "@gravity-ui/icons";
import {
  Dropdown,
  Button,
  Label,
  Description,
  ButtonGroup,
} from "@heroui/react";
import { useActivityContext } from "../../Context/ActivityContext";

const ShuffleButton = ({ activityId }: { activityId: string }) => {
  const { activities, reshuffle } = useActivityContext();
  const activity = activities.find((a) => a.id === activityId);

  return (
    <ButtonGroup>
      <Button
        variant="ghost"
        className="bg-white"
        onPress={() => {
          if (!activity) return;
          reshuffle(activity, false);
        }}
      >
        <Shuffle className="size-3.5" />
        Random shuffle
      </Button>
      <Dropdown>
        <Button
          isIconOnly
          aria-label="More options"
          variant="ghost"
          className="bg-white"
        >
          <ChevronDown />
        </Button>
        <Dropdown.Popover className="max-w-72.5" placement="bottom end">
          <Dropdown.Menu>
            <Dropdown.Item
              className="flex flex-col items-start gap-1"
              id="random-shuffle"
              textValue="Random Shuffle"
              onPress={() => {
                if (!activity) return;
                reshuffle(activity, false);
              }}
            >
              <Label>Random Shuffle</Label>
              <Description>
                Randomly assign players to courts, regardless of skill level
              </Description>
            </Dropdown.Item>
            <Dropdown.Item
              className="flex flex-col items-start gap-1"
              id="skill-based-shuffle"
              textValue="Skill Based Shuffle"
              onPress={() => {
                if (!activity) return;
                reshuffle(activity, true);
              }}
            >
              <Label>Skill Based Shuffle</Label>
              <Description>
                Assign players to courts by balancing skill levels across all
                courts
              </Description>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </ButtonGroup>
  );
};

export default ShuffleButton;
