import type { SaleData } from "./api.js";

export function deriveValue(sales: SaleData[]) {
  if (sales.length === 0) return 0;

  const salesPerBuyer = Object.values(
    Object.groupBy(sales, (i) => i.buyer),
  ).filter((i) => i !== undefined);

  const averagePerBuyer = salesPerBuyer.map((sales) => {
    const [sum, quantity] = sales.reduce(
      (acc, sale) => {
        acc[0] += sale.unitPrice * sale.quantity;
        acc[1] += sale.quantity;
        return acc;
      },
      [0, 0],
    );

    return sum / quantity;
  });

  return (
    averagePerBuyer.reduce((acc, v) => acc + v, 0) / averagePerBuyer.length
  );
}

/**
 * Resolve items to their container ids if necessary
 * @param itemId Item to normalise
 */
export function unboxItem(itemId: number) {
  switch (itemId) {
    case 1424:
    case 1425:
    case 1426:
    case 1427:
      return 1423; // iceberglet
    case 2222:
    case 2223:
    case 2224:
    case 2225:
    case 2226:
      return 2221; // great ball of Frozen Fire
    case 3193:
    case 3194:
    case 3195:
    case 3196:
    case 3197:
      return 3102; // naughty origami kit
    case 3322:
      return 3321; // packet of mayfly bait
    case 3662:
    case 2662:
    case 3664:
    case 3665:
    case 3666:
      return 3661; // container of Spooky Putty
    case 4403:
    case 4402:
    case 4401:
    case 4400:
    case 4399:
      return 4398; // stinky cheese ball
    case 4760:
      return 4759; // Grumpy Bumpkin's Pumpkin Seed Catalog
    case 5299:
      return 5301; // Make-Your-Own-Vampire-Fangs kit
    case 5404:
      return 5403; // Mint Salton Pepper's Peppermint Seed Catalog
    case 5880:
      return 5879; // Pete & Jackie's Dragon Tooth Emporium Catalog
    case 4930:
      return 6617; // over-the-shoulder Folder Holder
    case 7070:
      return 7069; // Discontent&trade; Winter Garden Catalog
    case 8185:
      return 8184; // Ed the Undying exhibit crate
    case 8382:
      return 8381; // Pack of Every Card
    case 9082:
      return 9081; // DIY protonic accelerator kit
    case 9104:
      return 9103; // Dear Past Self Package
    case 9493:
      return 9492; // suspicious package
    case 9508:
      return 9507; // LI-11 Motor Pool voucher
    case 9529:
      return 9528; // corked genie bottle
    case 9573:
      return 9572; // pantogram
    case 9592:
      return 9591; // locked mumming trunk
    case 9690:
      return 9689; // January's Garbage Tote (unopened)
    case 9760:
      return 9759; // Pok&eacute;fam Guide to Capturing All of Them
    case 9919:
      return 9920; // SongBoom&trade; BoomBox Box
    case 9928:
      return 9927; // Bastille Battalion control rig crate
    case 9987:
      return 9988; // latte lovers club card
    case 10058:
      return 10057; // Kramco Industries packing carton
    case 10166:
      return 10165; // mint condition Lil' Doctor&trade; bag
    case 10242:
      return 10241; // vampyric cloake pattern
    case 10251:
      return 10250; // Fourth of May Cosplay Saber kit
    case 10254:
      return 10256; // rune-strewn spoon cocoon
    case 10258:
      return 10257; // Beach Comb Box
    case 10333:
      return 10332; // Unopened Eight Days a Week Pill Keeper
    case 10335:
      return 10334; // unopened diabolic pizza cube box
    case 10438:
      return 10437; // mint-in-box Powerful Glove
    case 10482:
      return 10481; // Better Shrooms and Gardens catalog
    case 10533:
      return 10532; // Guzzlr application
    case 10574:
      return 10573; // bag of Iunion stones
    case 10582:
      return 10581; // packaged SpinMaster&trade; lathe
    case 10636:
      return 10635; // bagged Cargo Cultist Shorts
    case 10647:
      return 10646; // packaged knock-off retro superhero cape
    case 10651:
      return 10648; // box o' ghosts
    case 10730:
      return 10729; // packaged miniature crystal ball
    case 10734:
      return 10733; // emotion chip
    case 10738:
      return 10737; // power seed
    case 10749:
      return 10748; // packaged backup camera
    case 10759:
      return 10760; // packaged familiar scrapbook
    case 10797:
      return 10796; // packaged industrial fire extinguisher
    case 10804:
      return 10803; // packaged Daylight Shavings Helmet
    case 10815:
      return 10814; // packaged cold medicine cabinet
    case 10891:
      return 10890; // undrilled cosmic bowling ball
    case 10893:
      return 10892; // combat lover's locket lockbox
    case 10899:
      return 10898; // undamaged Unbreakable Umbrella
    case 10432:
      return 10431; // Retrospecs try-at-home kit
    case 10732:
      return 10731; // fresh can of paint
    case 10885:
      return 10884; // mint condition magnifying glass
    case 10920:
      return 10919; // packaged June cleaver
    case 10929:
      return 10928; // designer sweatpants (new old stock)
    case 10932:
      return 10931; // unopened tiny stillsuit
    case 10952:
      return 10951; // packaged Jurassic Parka
    case 10954:
      return 10953; // boxed autumn-aton
    case 11045:
      return 11044; // packaged model train set
    case 11100:
      return 11099; // Rock Garden Guide
    case 11116:
      return 11115; // S.I.T. Course Voucher
    case 11169:
      return 11168; // closed-circuit phone system
    case 11186:
      return 11187; // cursed monkey glove
    case 11223:
      return 11222; // shrink-wrapped Cincho de Mayo
    case 11257:
      return 11256; // shrink-wrapped 2002 Mr. Store Catalog
    case 11306:
      return 11305; // boxed august scepter
    case 11334:
      return 11333; // book of facts
    case 11363:
      return 11364; // wrapped candy cane sword cane
    case 11546:
      return 11545; // in-the-box spring shoes
    case 11472:
      return 11471; // Black and White Apron Enrollment Form
    default:
      return itemId;
  }
}
