import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import Badge from "./Badge";

export default function PlanBadge({ premium }) {
  if (premium) {
    return (
      <Badge variant="premium" icon={<FontAwesomeIcon icon={faCrown} style={{ fontSize: 8 }} />}>
        Premium
      </Badge>
    );
  }
  return <Badge variant="free">Free</Badge>;
}
